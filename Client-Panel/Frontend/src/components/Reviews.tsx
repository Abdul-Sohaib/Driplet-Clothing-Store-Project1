/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, Component, type ReactNode } from "react";
import axios from "axios";
import { AiFillStar } from "react-icons/ai";
import { toast } from "react-toastify";
import { motion, type Variants } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsProps {
  productId: string | number;
}

// Error Boundary Component
class ReviewsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in Reviews component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-center text-red-500 navfonts">Something went wrong while displaying reviews. Please try again later.</div>;
    }
    return this.props.children;
  }
}

const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const slideUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
      },
    },
  };

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching reviews for productId:", productId);
      const res = await axios.get(`${API_BASE}/reviews/${productId}`, {
        withCredentials: true,
      });
      console.log("GET /api/reviews/:productId response:", {
        status: res.status,
        data: res.data,
        headers: res.headers,
      });
      let reviewsData = res.data;
      if (!Array.isArray(reviewsData)) {
        if (res.data.reviews && Array.isArray(res.data.reviews)) {
          console.log("Extracting reviews from nested object:", res.data.reviews);
          reviewsData = res.data.reviews;
        } else if (res.data.review && res.data.message) {
          console.log("Converting single review object to array:", res.data.review);
          reviewsData = [res.data.review];
        } else {
          console.error("Invalid reviews response, expected array:", res.data);
          setError("Invalid response from server.");
          setReviews([]);
          return;
        }
      }
      setReviews(reviewsData);
      console.log("Fetched reviews:", reviewsData.length, reviewsData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load reviews.";
      console.error("Fetch reviews error:", {
        message: errorMessage,
        status: err.response?.status,
        response: err.response?.data,
        headers: err.response?.headers,
        stack: err.stack,
      });
      setError(errorMessage);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async () => {
    if (isSubmitting) return;
    if (!rating) {
      toast.error("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("POST /api/reviews/:productId request:", { productId, rating, comment });
      const res = await axios.post(
        `${API_BASE}/reviews/${productId}`,
        { rating, comment },
        { withCredentials: true }
      );
      console.log("POST /api/reviews/:productId response:", {
        status: res.status,
        data: res.data,
        headers: res.headers,
      });
      let responseData = res.data;
      if (Array.isArray(responseData)) {
        console.error("Unexpected array response:", responseData);
        if (responseData.length === 0) {
          console.error("Empty array response received, indicating server error");
          throw new Error("Failed to submit review: Server returned empty response");
        }
        if (responseData.length === 1 && responseData[0].id) {
          console.warn("Converting single-item array to expected format:", responseData[0]);
          responseData = { message: "Review submitted successfully", review: responseData[0] };
        } else {
          throw new Error(
            `Invalid API response: expected review object, received array of length ${responseData.length}`
          );
        }
      }
      if (!responseData || !responseData.review || !responseData.review.id) {
        console.error("Invalid response, expected { message, review }:", responseData);
        throw new Error(
          `Invalid API response: expected review object, received ${typeof responseData}`
        );
      }
      await fetchReviews();
      setRating(0);
      setComment("");
      toast.success(responseData.message || "Review submitted successfully!");
    } catch (err: any) {
      console.error("Submit review error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        stack: err.stack,
      });
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to submit a review."
          : err.response?.status === 404
          ? "Product not found."
          : err.response?.data?.message || "Failed to submit review. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 navfonts">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 navfonts">{error}</div>;
  }

  return (
    <ReviewsErrorBoundary>
      <motion.div
        className="mx-4 my-6"
        variants={slideUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-semibold text-black mb-4 textheading  uppercase">Customer Reviews</h2>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <AiFillStar
                key={star}
                className={`text-2xl cursor-pointer ${
                  star <= rating ? "text-orange-500" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <textarea
            className="w-full p-3 border-2 border-[#101A13] rounded-md text-sm text-black navfonts focus:outline-none focus:border-[#101A13] navfonts"
            placeholder="Write your review here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <button
            className={`mt-2  text-sm font-semibold navfonts text-black button-add  rounded-md  cursor-pointer ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmitReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-600 navfonts">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={slideUp}
                transition={{ delay: reviews.indexOf(review) * 0.1 }}
                initial="hidden"
                animate="visible"
                className="border-t border-[#101A13] pt-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <AiFillStar
                        key={star}
                        className={`text-[14px] ${
                          star <= review.rating ? "text-orange-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-black navfonts">{review.userName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-gray-800 navfonts mt-1">{review.comment || "No comment provided."}</p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </ReviewsErrorBoundary>
  );
};

export default Reviews;