let score=0;
let theAnswer="kampala";

userAnswer=prompt("What is the capital of Uganda?");
if(userAnswer==theAnswer){
    score=score+1;
    alert("Correct! Your score is "+score);
}
else {
    alert("Wrong! The correct answer is "+ theAnswer +". Your score is " +score); 
}