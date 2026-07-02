import { useEffect } from "react"



import "./QuizPage.css"


function QuizPage({ToLogin}) {

    async function VerifyToken() {
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

        
    }



    useEffect(()=> {
        if (location.port != 3000) {return}
        VerifyToken()
    },[])



    return (
        <div>
            <h1>QuizPage</h1>
        </div>
    )
}


export default QuizPage