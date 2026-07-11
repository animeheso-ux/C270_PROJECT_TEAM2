import { useState } from "react"
import "./Createquiz.css"

function BookIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
    )
}

function BoltIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>
        </svg>
    )
}

function TrophyIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h8"/>
            <path d="M12 17v4"/>
            <path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/>
            <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4"/>
            <path d="M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4"/>
        </svg>
    )
}

function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
    )
}

function CreateQuizPage({ToQuizPage}) {
    const [Topic,SetTopic] = useState("")
    const [Questions,SetQuestions] = useState([{
        "Question" : "",
        "Options" : {
            1 : "",
            2 : "",
            3 : ""
        },
        "Answer" : ""
    }])


    function CreateQuestion() {


        const QuestionArray = [...Questions]

        QuestionArray.unshift({
        "Question" : "",
        "Options" : {
            1 : "",
            2 : "",
            3 : ""
        },
        "Answer" : ""
        })

        SetQuestions(QuestionArray)
    }

    function RemoveQuestion(index) {
        if (Questions.length == 1) {return}

        const QuestionArray = [...Questions]
        QuestionArray.splice(index,1)
        SetQuestions(QuestionArray)
    }

    function UpdateQuestion(index, value) {
    const copy = [...Questions];
    copy[index].Question = value;
    SetQuestions(copy);
    }

    function UpdateOptions(index, value,option_num) {
    const copy = [...Questions];
    copy[index].Options[option_num] = value;
    SetQuestions(copy);
    }


    function UpdateAnswer(index, option_num) {
    const copy = [...Questions];
    copy[index].Answer = String(option_num);
    SetQuestions(copy);
    }




    async function CreateQuiz(e) {
        e.preventDefault();

        const TopicValue = document.getElementById("Topic")?.value

        for (let i = 0; i < Questions.length; i++) {
            const q = Questions[i]
            if (!q.Question || !q.Options[1] || !q.Options[2] || !q.Options[3] || !q.Answer) {
                alert(`Question ${i + 1} is missing a field, or has no correct answer selected.`)
                return
            }
        }

        const response = await fetch("/CreateQuiz",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({Quiz : Questions,Topic : TopicValue})
        })

        const data = await response.json()

        alert(data.status)
        if (data.status == "success") {
            ToQuizPage()
        }
    }

    const LoadQuestions = Questions.map((question,index)=> {
        return (
        <div className="CQ-QuestionCard" key={index}>

            <div className="CQ-QuestionCardHeader">
                <span className="CQ-QuestionNumber">Question {index + 1}</span>
                {Questions.length > 1 && (
                    <button type="button" className="CQ-RemoveButton" onClick={()=> RemoveQuestion(index)}>
                        <TrashIcon/>
                    </button>
                )}
            </div>

            <input
                className="CQ-Input"
                type="text"
                placeholder="Question"
                value={question.Question}
                onChange={(e) => UpdateQuestion(index, e.target.value)}
                required
            />

            <div className="CQ-OptionsGrid">
                <input
                    className="CQ-Input"
                    type="text"
                    placeholder="Option 1"
                    value={question["Options"][1]}
                    onChange={(e) => UpdateOptions(index, e.target.value,1)}
                    required
                />
                <input
                    className="CQ-Input"
                    type="text"
                    placeholder="Option 2"
                    value={question["Options"][2]}
                    onChange={(e) => UpdateOptions(index, e.target.value,2)}
                    required
                />
                <input
                    className="CQ-Input"
                    type="text"
                    placeholder="Option 3"
                    value={question["Options"][3]}
                    onChange={(e) => UpdateOptions(index, e.target.value,3)}
                    required
                />
            </div>

            <div className="CQ-AnswerRow">
                <span className="CQ-AnswerLabel">Correct answer</span>
                <div className="CQ-AnswerChips">
                    {[1,2,3].map((num)=> {
                        const IsSelected = question.Answer == String(num)
                        return (
                            <button
                                type="button"
                                key={num}
                                className={`CQ-Chip ${IsSelected ? "is-selected" : ""}`}
                                onClick={()=> UpdateAnswer(index,num)}
                            >
                                Option {num}
                            </button>
                        )
                    })}
                </div>
            </div>

        </div>
        )
    })



    return (
        <div className="CQ-Shell">

            <div className="CQ-LeftPanel">

                <div className="CQ-Brand">Learning Quest</div>

                <div className="CQ-LeftContent">
                    <h1 className="CQ-Headline">Build a new quiz module.</h1>
                    <p className="CQ-Subtext">Give it a name, add as many questions as you like, and mark which option is correct for each.</p>

                    <div className="CQ-StepList">
                        <div className="CQ-Step">
                            <div className="CQ-StepBadge">01</div>
                            <div>
                                <div className="CQ-StepTitle">Name your module</div>
                                <div className="CQ-StepSub">Pick something learners will recognize</div>
                            </div>
                        </div>
                        <div className="CQ-Step">
                            <div className="CQ-StepBadge">02</div>
                            <div>
                                <div className="CQ-StepTitle">Add your questions</div>
                                <div className="CQ-StepSub">Three options each, in any order</div>
                            </div>
                        </div>
                        <div className="CQ-Step">
                            <div className="CQ-StepBadge">03</div>
                            <div>
                                <div className="CQ-StepTitle">Mark the right answer</div>
                                <div className="CQ-StepSub">Tap the correct option for each question</div>
                            </div>
                        </div>
                    </div>

                    <button type="button" className="CQ-GhostButton" onClick={ToQuizPage}>
                        Back to modules
                    </button>
                </div>

            </div>

            <div className="CQ-RightPanel">
                <form className="CQ-Form" onSubmit={CreateQuiz}>

                    <div className="CQ-FormHeader">
                        <input
                            id="Topic"
                            name="Topic"
                            className="CQ-TopicInput"
                            type="text"
                            placeholder="Module name"
                            required
                        />

                        <button type="button" className="CQ-AddButton" onClick={CreateQuestion}>
                            + Add question
                        </button>
                    </div>

                    <div className="CQ-QuestionList">
                        {LoadQuestions}
                    </div>

                    <button type="submit" className="CQ-PrimaryButton">
                        Create quiz
                    </button>

                </form>
            </div>

        </div>
    )
}


export default CreateQuizPage