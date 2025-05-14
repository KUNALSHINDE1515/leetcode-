import db from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/jude0.libs.js";


export const createProblem = async (req, res) => {
    // going to get the data from the request body
    const {title, description, difficulty, tags, examples, constraints, testcases, condeSnippets, referenceSolutions} = req.body;
    //  going to check if the user is admin or not

    if(req.user.role !=="ADMIN"){
        return res.status(403).json({
            error: "You are not allowed to create a problem"
        })
    }

        try {
            for(const [language, solutionCode] of Object.entries(referenceSolutions)){
                const  languageId = getJudge0LanguageId(language);
                if(!languageId){
                    return res.status(400).json({
                        error: `language ${language} is not supported`
                    })
                }

                //

                const submission = testcases.map(({input , output}) =>( {
                    source_code: solutionCode,
                    language_id: languageId,
                    stdin: input,
                    expected_output: output,
                })) 

                const submissionResult = await submitBatch(submission);

                const tokens = submissionResult.map((res) =>res.token);

                const results = await pollBatchResults(tokens);

                for(let i = 0; i < results.lenght; i++){
                    
                    const result = results[i];
                    console.log("Results:",result);

                    console.log(
                        `Testcase ${i + 1} and language ${language} ------ result ${JSON.stringify(result.status.description)}`
                    );
                    

                    if(result.status.id !== 3){
                        return res.status(400).json({
                            error: `Testcase ${i+1} failed for language ${language}`
                        })
                    }
                }

                const newProblem = await db.problem.create({
                   data:{
                    title, 
                    description, 
                    difficulty, 
                    tags, 
                    examples, 
                    constraints, 
                    testcases, 
                    condeSnippets, 
                    referenceSolutions, 
                    userId: req.user.id
                },
                   
                })
                return res.status(201).json({
                    sucess: true,
                    message: "Message created Successfully",
                    problem: newProblem
                });
                
            }
        } catch (error) {
            console.log("Error in create a Problem",error);

            return res.status(500).json({
                error: "Error while creating a Problem"
            })
            
        }
    }

    //  loop through each referencd solution in different languages


export const getAllProblem = async (req, res) => {
    try {
        const problem = await db.problem.findMany();

        if (!problem) {
            return res.status(404).json({
                error: "No Problem Found"
            })
        }

        res.status(200).json({
            sucess: true,
            message : "Message Fetched Successfully",
            problem
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error:"Error While Fetching the Problems"
        })
        
    }
}

export const getProblem = async (req, res) => {
    const {id} = req.params;
    try {
        const problem = await db.problem.findUnique({
            where:{
                id
            }
        })
        
        if (!problem) {
            return res.status(404).json({
                error: "Problem not found."
            })
        }
        return res.status(201).json({
            sucess:true,
            message:"Message Created Successfully",
            problem
        });
    } catch (error) {
        console.log("Error in get Problem:",error);
        return res.status(500).json({
            error: "Error While Fetching Problem By Id"
        })
        
    }
}

// Implement by your self 
export const updateProblem = async (req, res) => {
    // id
    // id se problem find kiya (conditon check)
    // bakki kam same hai
    // intade of create we are use update

}

export const deleteProblem = async (req, res) => {
  try {
      const {id} = req.params;

    const problem = await db.problem.findUnique({where:{id}});

    if (!problem) {
        return res.status(404).json({
            error:"Problem not found"
        })
  
    }
    await db.problem.delete({where:{id}});

    return res.status(200).json({
      sucess: true,
      message: "Problem deleted Successfully"
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
        error: "Error While deleting Problem"
    })
    
  }

}
export const getSolvedProblems = async (req, res) => {

    
    
    
}

