import { useEffect , useState } from "react"



import "./QuizPage.css"
import { useSyncExternalStore } from "react"


function BookIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
    )
}

function ChartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/>
            <path d="M18 9l-5 5-3-3-4 4"/>
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

function ArrowIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
            <path d="M13 5l7 7-7 7"/>
        </svg>
    )
}


function QuizPage({ToLogin,ToQuizCreation}) {
  const [Topics,SetTopics] = useState([])
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [activeModuleName, setActiveModuleName] = useState("");

    async function GetToken() {
        const Token = localStorage.getItem("Token")

        if (!Token) {
            ToLogin()
            return
        }

        const response = await fetch("/GetToken",{
            headers : {
                "authorization" : `Bearer ${Token}`,
                "Content-Type" : "application/json"
            }
            
        })

        const data = await response.json()


        if (data.status != "success") {
            console.log("Invalid!")
            ToLogin()
        }

        return data.Token
    }

    

    async function GetTopics() {
        const response = await fetch("/GetTopics")

        const data = await response.json()

        SetTopics(data.result)
    }

    async function LoadQuestions(module_id) {
         const response = await fetch("/GetQuestions",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({id : module_id})
         })

        const data = await response.json()

        const QuestionsWithOptions = await Promise.all(
            data.result.map(async (question)=> {
                const OptionsData = await GetOptions(question.question_id)

                const OptionsObject = {}
                OptionsData.forEach((option,index)=> {
                    OptionsObject[index + 1] = option.option_text
                })

                return {...question, options : OptionsObject}
            })
        )

        setQuestions(QuestionsWithOptions)
    }

    async function GetOptions(question_id) {
        const response = await fetch(`/GetOptions/${question_id}`)

        const data = await response.json()

        return data.result
    }

    function HandleTopicClick(module_id,module_name) {
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setFeedback("")
        setScore(0)
        setFinished(false)
        setActiveModuleName(module_name)
        LoadQuestions(module_id)
    }

    function HandleAnswerClick(optionKey) {
        if (selectedAnswer != null) {
            return
        }

        setSelectedAnswer(optionKey)

        if (optionKey == questions[currentIndex].answer) {
            setFeedback("Correct!")
            setScore(score + 1)
        }
        else {
            const CorrectText = questions[currentIndex].options[questions[currentIndex].answer]
            setFeedback(`Not quite. The right answer was "${CorrectText}"`)
        }
    }

    function HandleNext() {
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1)
            setSelectedAnswer(null)
            setFeedback("")
        }
        else {
            setFinished(true)
        }
    }

    function HandleRestart() {
        setQuestions([])
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setFeedback("")
        setScore(0)
        setFinished(false)
        setActiveModuleName("")
    }



    useEffect(()=> {
        GetTopics()
    },[])

    useEffect(()=> {
        if (location.port != 3000) {return}
        GetToken()
    },[])


    const OnTopicScreen = questions.length == 0
    const OnQuizScreen = questions.length > 0 && !finished
    const OnFinishedScreen = finished


    return (
        <div className="Quiz-Shell">

            <div className="Quiz-LeftPanel">

                <div className="Quiz-Brand">Learning Quest</div>

                {OnTopicScreen && (
                    <div className="Quiz-LeftContent">
                        <h1 className="Quiz-Headline">Pick a module.<br/>Prove what you know.</h1>
                        <p className="Quiz-Subtext">Every module is a short, focused quiz. Answer at your own pace and see exactly where you stand.</p>

                        <div className="Quiz-FeatureList">
                            <div className="Quiz-Feature">
                                <div className="Quiz-FeatureIcon"><BookIcon/></div>
                                <div>
                                    <div className="Quiz-FeatureTitle">{Topics.length} module{Topics.length == 1 ? "" : "s"} available</div>
                                    <div className="Quiz-FeatureSub">Pick any one to begin</div>
                                </div>
                            </div>
                            <div className="Quiz-Feature">
                                <div className="Quiz-FeatureIcon"><BoltIcon/></div>
                                <div>
                                    <div className="Quiz-FeatureTitle">Instant feedback</div>
                                    <div className="Quiz-FeatureSub">Know right away if you're right</div>
                                </div>
                            </div>
                            <div className="Quiz-Feature">
                                <div className="Quiz-FeatureIcon"><ChartIcon/></div>
                                <div>
                                    <div className="Quiz-FeatureTitle">Score tracking</div>
                                    <div className="Quiz-FeatureSub">See your result at the end</div>
                                </div>
                            </div>
                        </div>


                    </div>
                )}

                {OnQuizScreen && (
                    <div className="Quiz-LeftContent">
                        <div className="Quiz-Eyebrow">{activeModuleName}</div>
                        <h1 className="Quiz-Headline">Question {currentIndex + 1} of {questions.length}</h1>
                        <p className="Quiz-Subtext">Take your time. You can't go back once you move on.</p>

                        <div className="Quiz-ProgressTrack">
                            <div className="Quiz-ProgressFill" style={{width : `${((currentIndex) / questions.length) * 100}%`}}></div>
                        </div>

                        <div className="Quiz-FeatureList">
                            <div className="Quiz-Feature">
                                <div className="Quiz-FeatureIcon"><TrophyIcon/></div>
                                <div>
                                    <div className="Quiz-FeatureTitle">{score} correct so far</div>
                                    <div className="Quiz-FeatureSub">out of {currentIndex} answered</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {OnFinishedScreen && (
                    <div className="Quiz-LeftContent">
                        <div className="Quiz-Eyebrow">{activeModuleName}</div>
                        <h1 className="Quiz-Headline">Quiz complete.</h1>
                        <p className="Quiz-Subtext">Here's how you did. Retake it anytime to sharpen your score.</p>

                        <div className="Quiz-ScoreBig">{score}<span className="Quiz-ScoreOutOf"> / {questions.length}</span></div>

                        <button className="Quiz-GhostButton" onClick={HandleRestart}>
                            Back to modules
                        </button>
                    </div>
                )}

            </div>

            <div className="Quiz-RightPanel">

                {OnTopicScreen && (
                    <div className="Quiz-RightInner">
                        <div className="Quiz-RightHeading">Welcome back!</div>
                        <p className="Quiz-RightSubheading">Choose a module to start your quiz.</p>

                        <div className="Quiz-TopicGrid">
                            {Topics.map((topic)=> {
                                return (
                                    <button key={topic.module_id} className="Quiz-TopicCard" onClick={()=> {HandleTopicClick(topic.module_id,topic.module_name)}}>
                                        <div>
                                            <div className="Quiz-TopicName">{topic.module_name}</div>
                                            {topic.description && <div className="Quiz-TopicDesc">{topic.description}</div>}
                                        </div>
                                        <ArrowIcon/>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {OnQuizScreen && questions[currentIndex] && (
                    <div className="Quiz-RightInner">
                        <div className="Quiz-QuestionCard">
                            <h2 className="Quiz-QuestionText">{questions[currentIndex].question_text}</h2>

                            <div className="Quiz-OptionsList">
                                {Object.entries(questions[currentIndex].options).map(([Key,Value])=> {

                                    let RowClass = "Quiz-OptionRow"

                                    if (selectedAnswer != null) {
                                        if (Key === questions[currentIndex].answer) {
                                            RowClass += " is-correct"
                                        }
                                        else if (Key === selectedAnswer) {
                                            RowClass += " is-wrong"
                                        }
                                        else {
                                            RowClass += " is-disabled"
                                        }
                                    }

                                    return (
                                        <button key={Key} className={RowClass} onClick={()=> {HandleAnswerClick(Key)}} disabled={selectedAnswer != null}>
                                            {Value}
                                        </button>
                                    )
                                })}
                            </div>

                            {feedback && (
                                <div className={`Quiz-FeedbackBanner ${feedback == "Correct!" ? "is-correct" : "is-wrong"}`}>
                                    {feedback}
                                </div>
                            )}

                            {selectedAnswer != null && (
                                <button className="Quiz-PrimaryButton" onClick={HandleNext}>
                                    {currentIndex + 1 < questions.length ? "Next question" : "See results"}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {OnFinishedScreen && (
                    <div className="Quiz-RightInner">
                        <div className="Quiz-ResultCard">
                            <div className="Quiz-ResultLabel">Your result</div>
                            <div className="Quiz-ResultScore">{Math.round((score / questions.length) * 100)}%</div>
                            {Math.round((score / questions.length) * 100) > 50 ? <h1>Well done!</h1> : <h1>Try harder next time!</h1>}


                            <div className="Quiz-ResultSub">{score} out of {questions.length} correct</div>
                            <button className="Quiz-PrimaryButton" onClick={HandleRestart}>
                                Try another module
                            </button>
                        </div>
                    </div>
                )}

            </div>

        </div>
    )
}


export default QuizPage