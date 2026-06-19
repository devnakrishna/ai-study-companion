function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <p className="q">{review.question}</p>

      <p>
        <b>Your Answer:</b>{" "}
        <span className={review.is_correct ? "correct" : "wrong"}>
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
    </div>
  );
}

export default ReviewCard;