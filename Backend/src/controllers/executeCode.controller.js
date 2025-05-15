import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/jude0.libs.js";
import db from "../libs/db.js"
export const executeCode = async (req, res) => {
  try {
    const {
      source_code,
      language_id,
      stdin,
      expected_outputs,
      problemId,
    } = req.body;

    const userId = req.user.id;

    // validate test cases

    if (
      !Array.isArray(stdin) ||
      stdin.length == 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({
        error: "Invalid or Missing test Cases",
      });
    }

    // 2. Prepare each test cases for the judge0 batch submmsion

    const submmsion = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // 3. Send batch of submission to judge0

    const submitRespose = await submitBatch(submmsion);

    const tokens = submitRespose.map((res) => res.token);

    // 4. Poll judge0 for the result of all submmited test cases.

    const results = await pollBatchResults(tokens);

    console.log("Result__________________");
    console.log(results);

    // Analyze test case result
    let allPassed = true;

    const detailedResult = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;

      if (!passed) allPassed = false;

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory}KB ` : undefined,
        time: result.time ? `${result.time} S` : undefined,
      };

      // console.log(`Testcase #${i+1}`);
      // console.log(`Input for testcase #${i+1} :  ${stdin[i]}`);
      // console.log(`Expected Output for the test case #${i+1} : ${expected_output}`);
      // console.log(`Actual Outputs #${i+1} : ${stdout}`);

      // console.log("Mached :", passed);
    });

    console.log(detailedResult);

    //Store submission summary
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResult.map((r) => r.stdout)),
        stderr: detailedResult.some((r) => r.stderr)
          ? JSON.stringify(detailedResult.map((r) => r.stderr))
          : null,
        compileOutput: detailedResult.some((r) => r.compile_output)
          ? JSON.stringify(detailedResult.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResult.some((r) => r.memory)
          ? JSON.stringify(detailedResult.map((r) => r.memory))
          : null,
        time: detailedResult.some((r) => r.time)
          ? JSON.stringify(detailedResult.map((r) => r.time))
          : null,
      },
    });

    // If all passed = true mark problem an solved for the current user

    if (allPassed) {
        await db.problemSolved.upsert({
            where:{
                userId_problemId:{
                    userId, problemId
                }
            },
            update:{},
            create:{
                userId, problemId
            }
        })
    }

    // 8 save indiviual test case result using details

    const testCaseResult = detailedResult.map((result) => ({
        submissionId: submission.id,
        testCase:result.testCase,
        passed:result.passed,
        stdout: result.stdout,
        expected: result.expected,
        stderr: result.stderr,
        compileOutput: result.compile_output,
        status: result.status,
        memory: result.memory,
        time: result.time,

    }))

    await db.TestCaseResult.createMany({
        data:testCaseResult
    })

    const submissionWithTestCase = await submission.findUnique({
        where:{
            id:submission.id
        },
        include:{
            testCase:true
        }
    }) 

    res.status(200).json({
      success: true,
      message: "Code Executed! Succesfully!",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.error("Error executing code:",error.message)
    res.status(500).json({
        error:"Faild  to execute code"
    })
  }
};
