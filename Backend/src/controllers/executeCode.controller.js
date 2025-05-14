import { pollBatchResults, submitBatch } from "../libs/jude0.libs.js";

export const executeCode = async(req,res) => {

    try {
        const {source_code, language_id, stdin, expected_outputs,problemId} = req.body;

        const userId = req.user.id;

        // validate test cases

        if (
            !Array.isArray(stdin) ||
            stdin.length == 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({
                error: "Invalid or Missing test Cases"
            })
        }

        // 2. Prepare each test cases for the judge0 batch submmsion

        const submmsion = stdin.map((input) => ({
            source_code,
            language_id,
            stdin:input,
        }));


        // 3. Send batch of submission to judge0

        const submitRespose = await submitBatch(submmsion)

        const tokens = submitRespose.map((res) => res.token)

        // 4. Poll judge0 for the result of all submmited test cases.

        const results = await pollBatchResults(tokens)
       

        console.log("Result__________________");
        console.log(results);
        

        res.status(200).json({
            message: "Code Executed"
        })
        
    } catch (error) {
        
    }
}