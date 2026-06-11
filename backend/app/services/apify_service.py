# import logging
# from typing import Dict, Any, Optional
# from apify_client import ApifyClient
# from app.core.config import settings

# logger = logging.getLogger(__name__)


# class ApifyService:
#     """
#     Service wrapper for LinkedIn scraping using Apify.
#     """
#     def __init__(self):
#         self.api_token = settings.APIFY_API_TOKEN

#     def enrich_linkedin_profile(self, linkedin_url: str) -> Optional[Dict[str, Any]]:
#         """
#         Fetch LinkedIn profile data using Apify LinkedIn Profile Scraper Actor.
#         """
#         if not self.api_token:
#             logger.error("APIFY_API_TOKEN is not set.")
#             return None

#         logger.info(f"Fetching LinkedIn profile data for {linkedin_url} using Apify")

#         client = ApifyClient(self.api_token)

#         run_input = {
#             "url": linkedin_url,
#             "use_cache": True,
#             "maximum_cache_age": 2592000,
#         }

#         try:
#             # Run the Actor and wait for it to finish
#             # Actor ID: 87AaxKjjQrK0F0g60 (LinkedIn Profile Scraper)
#             run = client.actor("87AaxKjjQrK0F0g60").call(run_input=run_input)

#             # Fetch results from the run's dataset
#             dataset_id = None
#             if hasattr(run, "default_dataset_id") and run.default_dataset_id:
#                 dataset_id = run.default_dataset_id
#             elif isinstance(run, dict):
#                 dataset_id = run.get("default_dataset_id") or run.get("defaultDatasetId")
#             else:
#                 try:
#                     dataset_id = run["defaultDatasetId"]
#                 except Exception:
#                     try:
#                         dataset_id = run["default_dataset_id"]
#                     except Exception:
#                         pass

#             if not dataset_id:
#                 logger.error("Could not extract default_dataset_id from Apify run object")
#                 return None

#             items = list(client.dataset(dataset_id).iterate_items())
            
#             if not items:
#                 logger.error("No results returned in dataset from Apify run")
#                 return None

#             data = items[0]
#             logger.info("Apify LinkedIn scraper response received successfully")

#             # Extract basic info with various fallbacks
#             full_name = data.get("fullName") or data.get("name")
#             if not full_name:
#                 first = data.get("firstName") or ""
#                 last = data.get("lastName") or ""
#                 full_name = f"{first} {last}".strip()

#             designation = data.get("currentTitle") or data.get("title") or data.get("designation") or data.get("occupation") or ""
#             if not designation and data.get("job_titles") and isinstance(data.get("job_titles"), list) and len(data.get("job_titles")) > 0:
#                 designation = data.get("job_titles")[0]

#             location = data.get("location") or data.get("locationName") or ""

#             experience_list = data.get("experience", [])
#             education_list = data.get("education", [])
#             publications_list = data.get("publications", [])
#             organisations_list = data.get("organisations") or data.get("organizations", [])
#             skills_list = data.get("skills", [])
#             certifications_list = data.get("certifications", [])

#             # Fallbacks for company/designation if missing at top-level
#             company = data.get("currentCompany") or data.get("company") or data.get("currentCompanyName") or ""
#             if isinstance(experience_list, list) and experience_list:
#                 if not company:
#                     first_exp = experience_list[0]
#                     if isinstance(first_exp, dict):
#                         company = first_exp.get("companyName") or first_exp.get("company") or ""
#                 if not designation:
#                     first_exp = experience_list[0]
#                     if isinstance(first_exp, dict):
#                         designation = first_exp.get("title") or ""

#             # Standardize experience dates and format
#             if isinstance(experience_list, list):
#                 for exp in experience_list:
#                     if isinstance(exp, dict) and "company" not in exp:
#                         exp["company"] = exp.get("companyName") or ""

#             # Check positionGroups, if not present group experience by company to build them
#             position_groups = data.get("positionGroups") or data.get("positiongroups")
#             if not position_groups:
#                 position_groups = []
#                 if isinstance(experience_list, list):
#                     for exp in experience_list:
#                         if not isinstance(exp, dict):
#                             continue
#                         comp_name = exp.get("companyName") or exp.get("company") or "Unknown Company"
#                         title = exp.get("title") or exp.get("designation") or designation or ""
#                         loc = exp.get("location") or ""
                        
#                         start_year = exp.get("startDate") or exp.get("start") or exp.get("start_date") or ""
#                         end_year = exp.get("endDate") or exp.get("end") or exp.get("end_date") or "Present"
#                         dates = exp.get("dates") or f"{start_year} - {end_year}"
                        
#                         pos_item = {
#                             "title": title,
#                             "location": loc,
#                             "dates": dates,
#                             "dateRange": dates,
#                             "description": exp.get("description", ""),
#                             "start_date": exp.get("start_date") or exp.get("startDate") or exp.get("start") or "",
#                             "end_date": exp.get("end_date") or exp.get("endDate") or exp.get("end") or ""
#                         }
                        
#                         # Find if there is an existing group for this company
#                         existing_group = next((g for g in position_groups if g["companyName"] == comp_name), None)
#                         if existing_group:
#                             existing_group["profilePositions"].append(pos_item)
#                         else:
#                             position_groups.append({
#                                 "companyName": comp_name,
#                                 "company": comp_name,
#                                 "profilePositions": [pos_item],
#                                 "title": title,
#                                 "location": loc,
#                                 "start_date": exp.get("start_date") or exp.get("startDate") or exp.get("start") or "",
#                                 "end_date": exp.get("end_date") or exp.get("endDate") or exp.get("end") or ""
#                             })

#             profile_picture = data.get("profilePicture") or data.get("profilePic") or data.get("profilePictureUrl") or data.get("image")
#             summary = data.get("summary") or data.get("about") or data.get("description")
#             languages_list = data.get("languages", [])

#             # Robust parsing for connections and followers integers
#             import re
#             def parse_int_robust(val):
#                 if val is None:
#                     return 0
#                 if isinstance(val, (int, float)):
#                     return int(val)
#                 if isinstance(val, str):
#                     nums = re.findall(r'\d+', val)
#                     return int(nums[0]) if nums else 0
#                 return 0

#             connection_count = parse_int_robust(data.get("connectionCount") or data.get("connections") or data.get("connectionsCount"))
#             follower_count = parse_int_robust(data.get("followerCount") or data.get("followers") or data.get("followersCount"))

#             return {
#                 "linkedin_url": linkedin_url,
#                 "full_name": full_name,
#                 "company": company,
#                 "designation": designation,
#                 "location": location,
#                 "experience": experience_list,
#                 "education": education_list,
#                 "publications": publications_list,
#                 "organisations": organisations_list,
#                 "position_groups": position_groups,
#                 "skills": skills_list,
#                 "profile_picture": profile_picture,
#                 "summary": summary,
#                 "languages": languages_list,
#                 "certifications": certifications_list,
#                 "connection_count": connection_count,
#                 "follower_count": follower_count
#             }

#         except Exception as e:
#             logger.error(f"Failed to fetch Apify data: {str(e)}")
#             return None


# apify_service = ApifyService()
import logging
from typing import Dict, Any, Optional

from apify_client import ApifyClient
from app.core.config import settings

logger = logging.getLogger(__name__)


class ApifyService:
    """
    LinkedIn enrichment using Apify Actor:
    LpVuK3Zozwuipa5bp
    """

    def __init__(self):
        self.api_token = settings.APIFY_API_TOKEN

    def enrich_linkedin_profile(
        self,
        linkedin_url: str
    ) -> Optional[Dict[str, Any]]:

        if not self.api_token:
            logger.error("APIFY_API_TOKEN not configured")
            return None

        try:
            client = ApifyClient(self.api_token)

            run_input = {
                "profileScraperMode": "Profile details no email ($4 per 1k)",
                "queries": [linkedin_url]
            }

            logger.info(
                f"Fetching LinkedIn profile using Apify: {linkedin_url}"
            )

            run = client.actor(
                "LpVuK3Zozwuipa5bp"
            ).call(run_input=run_input)

            # --------------------------------------------------
            # Extract Dataset ID (works with new Apify SDK)
            # --------------------------------------------------

            dataset_id = None

            try:
                dataset_id = run.default_dataset_id
            except AttributeError:
                pass

            if not dataset_id:
                try:
                    dataset_id = run["defaultDatasetId"]
                except Exception:
                    pass

            if not dataset_id:
                logger.error(
                    f"Failed to extract dataset id from run object: {run}"
                )
                return None

            logger.info(
                f"Dataset ID: {dataset_id}"
            )

            # --------------------------------------------------
            # Fetch Dataset Items
            # --------------------------------------------------

            items = list(
                client.dataset(
                    dataset_id
                ).iterate_items()
            )

            if not items:
                logger.warning(
                    f"No profile data returned for {linkedin_url}"
                )
                return None

            data = items[0]

            # --------------------------------------------------
            # Basic Information
            # --------------------------------------------------

            linkedin_url = data.get(
                "linkedinUrl",
                linkedin_url
            )

            first_name = data.get(
                "firstName",
                ""
            )

            last_name = data.get(
                "lastName",
                ""
            )

            full_name = (
                f"{first_name} {last_name}"
            ).strip()

            # --------------------------------------------------
            # Current Position
            # --------------------------------------------------

            company = ""
            designation = ""

            current_positions = data.get(
                "currentPosition",
                []
            )

            if (
                isinstance(current_positions, list)
                and current_positions
            ):
                current = current_positions[0]

                company = current.get(
                    "companyName",
                    ""
                )

                designation = current.get(
                    "position",
                    ""
                )

            # --------------------------------------------------
            # Location
            # --------------------------------------------------

            location = ""

            location_data = data.get(
                "location",
                {}
            )

            if isinstance(location_data, dict):

                location = (
                    location_data.get(
                        "parsed",
                        {}
                    ).get(
                        "text",
                        ""
                    )
                    or location_data.get(
                        "linkedinText",
                        ""
                    )
                )

            # --------------------------------------------------
            # Experience
            # --------------------------------------------------

            experience_list = []

            for exp in data.get(
                "experience",
                []
            ):

                experience_list.append({
                    "title": exp.get(
                        "position"
                    ),
                    "company": exp.get(
                        "companyName"
                    ),
                    "location": exp.get(
                        "location"
                    ),
                    "description": exp.get(
                        "description"
                    ),
                    "duration": exp.get(
                        "duration"
                    ),
                    "start_date": exp.get(
                        "startDate"
                    ),
                    "end_date": exp.get(
                        "endDate"
                    )
                })

            # --------------------------------------------------
            # Education
            # --------------------------------------------------

            education_list = []

            for edu in data.get(
                "education",
                []
            ):

                education_list.append({
                    "school_name": edu.get(
                        "schoolName"
                    ),
                    "degree": edu.get(
                        "degree"
                    ),
                    "field_of_study": edu.get(
                        "fieldOfStudy"
                    ),
                    "description": edu.get(
                        "description"
                    )
                })

            # --------------------------------------------------
            # Publications
            # --------------------------------------------------

            publications_list = data.get(
                "publications",
                []
            )

            # --------------------------------------------------
            # Organisations
            # --------------------------------------------------

            organisations_list = data.get(
                "volunteering",
                []
            )

            # --------------------------------------------------
            # Skills
            # --------------------------------------------------

            skills_list = []

            for skill in data.get(
                "skills",
                []
            ):

                if (
                    isinstance(skill, dict)
                    and skill.get("name")
                ):
                    skills_list.append(
                        skill["name"]
                    )

            # --------------------------------------------------
            # Languages
            # --------------------------------------------------

            languages_list = []

            for lang in data.get(
                "languages",
                []
            ):

                languages_list.append({
                    "name": lang.get(
                        "name"
                    ),
                    "proficiency": lang.get(
                        "proficiency"
                    )
                })

            # --------------------------------------------------
            # Certifications
            # --------------------------------------------------

            certifications_list = data.get(
                "certifications",
                []
            )

            # --------------------------------------------------
            # Profile Picture
            # --------------------------------------------------

            profile_picture = ""

            profile_pic = data.get(
                "profilePicture"
            )

            if isinstance(
                profile_pic,
                dict
            ):
                profile_picture = (
                    profile_pic.get(
                        "url",
                        ""
                    )
                )

            # --------------------------------------------------
            # Summary
            # --------------------------------------------------

            summary = data.get(
                "about",
                ""
            )

            # --------------------------------------------------
            # Followers & Connections
            # --------------------------------------------------

            connection_count = data.get(
                "connectionsCount",
                0
            )

            follower_count = data.get(
                "followerCount",
                0
            )

            # --------------------------------------------------
            # Position Groups
            # --------------------------------------------------

            company_map = {}

            for exp in data.get(
                "experience",
                []
            ):

                company_name = exp.get(
                    "companyName",
                    "Unknown Company"
                )

                position_item = {
                    "title": exp.get(
                        "position"
                    ),
                    "location": exp.get(
                        "location"
                    ),
                    "description": exp.get(
                        "description"
                    ),
                    "duration": exp.get(
                        "duration"
                    ),
                    "start_date": exp.get(
                        "startDate"
                    ),
                    "end_date": exp.get(
                        "endDate"
                    )
                }

                if company_name not in company_map:

                    company_map[
                        company_name
                    ] = {
                        "companyName": company_name,
                        "profilePositions": []
                    }

                company_map[
                    company_name
                ][
                    "profilePositions"
                ].append(
                    position_item
                )

            position_groups = list(
                company_map.values()
            )

            logger.info(
                f"Successfully enriched profile: {full_name}"
            )

            return {
                "linkedin_url": linkedin_url,
                "full_name": full_name,
                "company": company,
                "designation": designation,
                "location": location,
                "experience": experience_list,
                "education": education_list,
                "publications": publications_list,
                "organisations": organisations_list,
                "position_groups": position_groups,
                "skills": skills_list,
                "profile_picture": profile_picture,
                "summary": summary,
                "languages": languages_list,
                "certifications": certifications_list,
                "connection_count": connection_count,
                "follower_count": follower_count
            }

        except Exception as e:
            logger.exception(
                f"Apify profile enrichment failed: {str(e)}"
            )
            return None


apify_service = ApifyService()