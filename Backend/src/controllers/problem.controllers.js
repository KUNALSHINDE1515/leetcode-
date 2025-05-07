import {db} from "../libs/db.js";
import { pollBatchResults } from "../libs/jude0.libs.js";


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

                    if(result.status.id !== 3){
                        return res.status(400).json({
                            error: `Testcase ${i+1} failed for language ${language}`
                        })
                    }
                }

                const newProblem = awaiat.db.problem.create({
                   data:{title, description, difficulty, tags, examples, constraints, testcases, condeSnippets, referenceSolutions, userId: req.user.id},
                   
                })
                return res.statud(201).json(newProblem);
                
            }
        } catch (error) {
            
        }
    }

    //  loop through each referencd solution in different languages




export const getAllProblem = async (req, res) => {}

export const getProblem = async (req, res) => {}

export const updateProblem = async (req, res) => {}

export const deleteProblem = async (req, res) => {}

export const getSolvedProblems = async (req, res) => {}

