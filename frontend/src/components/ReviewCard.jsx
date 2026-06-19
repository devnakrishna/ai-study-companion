function ReviewCard({ review }) {
  let answerClass = "";

  if (review.type === "mcq") {
    answerClass = review.is_correct ? "correct" : "wrong";
  } else {
    if (review.score >= 4) answerClass = "correct";
    else if (review.score >= 2) answerClass = "average";
    else answerClass = "wrong";
  }

  return (
    <div className="review-card">
      <p className="q">{review.question}</p>

      <p>
        <b>Your Answer:</b>{" "}
        <span className={answerClass}>
          {review.your_answer}
        </span>
      </p>

      {review.type === "mcq" && (
        <p>
          <b>Correct Answer:</b>{" "}
          <span className="correct">
            {review.correct_answer}
          </span>
        </p>
      )}

      {review.type === "descriptive" && (
        <>
          <p><b>Score:</b> {review.score}/5</p>
          <p className="feedback">{review.feedback}</p>
        </>
      )}
    </div>
  );
}

export default ReviewCard;