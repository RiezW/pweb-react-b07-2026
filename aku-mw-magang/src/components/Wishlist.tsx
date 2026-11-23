// ini bagian Ciko

import type { Application } from "../types/application";
import { calculateSkillMatch } from "../utils/skillMatch";

interface WishlistProps {
  applications: Application[];
  captainSkills: string[];
  onRemove: (id: string) => void;
}

export function Wishlist({
  applications,
  captainSkills,
  onRemove,
}: WishlistProps) {
  const wishlistApplications = applications.filter(
    (application) => application.status === "WISHLIST"
  );

  return (
    <section className="wishlist-section">
      <div className="wishlist-header">
        <div>
          <h2>My Wishlist</h2>
          <p>Your saved job opportunities</p>
        </div>

        <span className="wishlist-count">
          {wishlistApplications.length} Saved
        </span>
      </div>

      {wishlistApplications.length === 0 ? (
        <div className="wishlist-empty">
          <h3>Your Wishlist is empty</h3>
          <p>
            Save interesting jobs from Job Explorer
            and they will appear here.
          </p>
        </div>
      ) : (
        <div className="wishlist-list">
          {wishlistApplications.map((application) => {
            const match = calculateSkillMatch(
              captainSkills,
              application.requiredSkills
            );

            const matchColor =
              match.matchScore >= 70
                ? "high"
                : match.matchScore >= 40
                  ? "medium"
                  : "low";

            return (
              <article
                className="wishlist-card"
                key={application.id}
              >
                <div className="wishlist-card-info">
                  <h3>{application.role}</h3>
                  <p>{application.company}</p>

                  <span className="wishlist-work-mode">
                    {application.workMode}
                  </span>
                </div>

                <div className="wishlist-card-actions">
                  <span
                    className={`wishlist-match ${matchColor}`}
                  >
                    {match.matchScore}% Match
                  </span>

                  <button
                    type="button"
                    className="wishlist-remove-button"
                    onClick={() => onRemove(application.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ini bagian ciko
