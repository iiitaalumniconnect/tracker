import logging
import json
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.models.core_models import AlumniMaster, ChangeLog, AlumniHistory

logger = logging.getLogger(__name__)


class ComparisonEngine:

    FIELDS_TO_COMPARE = ["full_name", "company", "designation", "location"]

    EXTRA_FIELDS = [
        "experience",
        "education",
        "skills",
        "profile_picture",
        "summary",
        "languages",
        "certifications",
        "connection_count",
        "follower_count",
        "publications",
        "organisations",
        "position_groups",
    ]

    def normalize(self, value):
        """
        Normalize values before comparison.
        Prevents false positives caused by:
        - spaces
        - case differences
        - None values
        - JSON formatting differences
        """
        if value is None:
            return ""

        if isinstance(value, str):
            # Strip whitespace and convert to lowercase for string comparison
            value = value.strip()
            if not value or value.lower() in ("none", "null", "nan", ""):
                return ""
            return value.lower()

        if isinstance(value, (dict, list)):
            # For complex types, serialize with sorted keys and separators for consistency
            try:
                return json.dumps(
                    value, sort_keys=True, separators=(",", ":"), default=str
                )
            except (TypeError, ValueError):
                return str(value).strip().lower()

        if isinstance(value, (int, float, bool)):
            # Convert numbers and booleans to string consistently
            return str(value).strip().lower()

        # Fallback for any other type
        return str(value).strip().lower()

    def compare_and_update(
        self, db: Session, alumni_id: int, new_data: Dict[str, Any]
    ) -> None:

        alumni = db.query(AlumniMaster).filter(AlumniMaster.id == alumni_id).first()

        if not alumni:
            logger.error(f"Alumni {alumni_id} not found for comparison")
            return

        old_data_dict = {
            "company": alumni.company,
            "designation": alumni.designation,
            "location": alumni.location,
            "experience": alumni.experience,
            "education": alumni.education,
            "skills": alumni.skills,
        }

        changes_detected = False
        extra_fields_updated = False

        # ----------------------------
        # Compare tracked fields
        # ----------------------------

        for field in self.FIELDS_TO_COMPARE:

            raw_old = getattr(alumni, field, None)
            raw_new = new_data.get(field)

            old_val = self.normalize(raw_old)
            new_val = self.normalize(raw_new)

            logger.info(f"{field} | OLD={repr(old_val)} " f"| NEW={repr(new_val)}")

            if not new_val:
                continue

            if old_val != new_val:

                changes_detected = True

                db.add(
                    ChangeLog(
                        alumni_id=alumni.id,
                        field_changed=field,
                        old_value=str(raw_old or ""),
                        new_value=str(raw_new or ""),
                    )
                )

                setattr(alumni, field, raw_new)

        # ----------------------------
        # Update extra fields
        # ----------------------------

        for field in self.EXTRA_FIELDS:

            if field not in new_data:
                continue

            raw_old = getattr(alumni, field, None)
            raw_new = new_data.get(field)

            old_val = self.normalize(raw_old)
            new_val = self.normalize(raw_new)

            if not new_val:
                continue

            if old_val != new_val:

                setattr(alumni, field, raw_new)
                extra_fields_updated = True

        # ----------------------------
        # Save history
        # ----------------------------

        if changes_detected:

            history = AlumniHistory(
                alumni_id=alumni.id, old_data=old_data_dict, new_data=new_data
            )

            db.add(history)

        # ----------------------------
        # Commit
        # ----------------------------

        if changes_detected or extra_fields_updated:
            try:
                db.commit()
            except Exception as e:
                db.rollback()
                logger.error(
                    f"Error occurred while committing changes for Alumni {alumni_id}: {str(e)}"
                )
                raise

            logger.info(f"Changes applied for Alumni {alumni_id}")

        else:

            logger.info(f"No changes detected for Alumni {alumni_id}")


comparison_engine = ComparisonEngine()
