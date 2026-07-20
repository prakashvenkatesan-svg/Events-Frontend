import {
  Check,
  ChevronLeft,
  Image,
  Save,
  Upload,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { api } from "../services/api";

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;


/*
 * Minimum banner dimensions.
 *
 * Larger images are accepted when their
 * aspect ratio is suitable.
 */
const MIN_BANNER_WIDTH = 1180;
const MIN_BANNER_HEIGHT = 448;

/*
 * Recommended banner ratio: 1440 × 550
 */
const TARGET_ASPECT_RATIO =
  1440 / 550;

/*
 * Accepts small aspect-ratio differences,
 * including 5036 × 1940px.
 */
const ASPECT_RATIO_TOLERANCE = 0.05;

const initialForm = {
  title: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  location: "",
  amount: "",
  bannerUrl: "",
  bannerFile: null,
};

export default function EventEditorPage() {
  const { eventId } = useParams();

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState(
    initialForm,
  );

  const [errors, setErrors] = useState({});

  const [
    bannerPreview,
    setBannerPreview,
  ] = useState("");

  const [loading, setLoading] = useState(
    Boolean(eventId),
  );

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [
    serverError,
    setServerError,
  ] = useState("");

  /*
   * Load existing event for editing.
   */
  useEffect(() => {
    if (!eventId) {
      return;
    }

    async function loadEvent() {
      setLoading(true);
      setServerError("");

      try {
        const event =
          await api.getAdminEvent(
            eventId,
          );

        setForm({
          title: event.title || "",

          eventDate:
            formatDateForInput(
              event.event_date,
            ),

          startTime:
            formatTimeForInput(
              event.start_time,
            ),

          endTime:
            formatTimeForInput(
              event.end_time,
            ),

          location:
            event.location || "",

          amount:
            event.amount !== undefined
              ? String(event.amount)
              : "",

          bannerUrl:
            event.banner_url || "",

          bannerFile: null,
        });

        setBannerPreview(
          event.banner_url || "",
        );
      } catch (error) {
        setServerError(
          error.message,
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  /*
   * Remove temporary image preview
   * when the component closes.
   */
  useEffect(() => {
    return () => {
      if (
        bannerPreview.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          bannerPreview,
        );
      }
    };
  }, [bannerPreview]);

  /*
   * Update one form field.
   */
  const updateField = (
    field,
    value,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: "",
    }));

    setSaved(false);
    setServerError("");
  };

  /*
   * Banner upload and validation.
   */
  const handleBannerChange = async (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    /*
     * Validate file format.
     */
    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setErrors((currentErrors) => ({
        ...currentErrors,

        banner:
          "Only JPG, PNG and WebP images are allowed.",
      }));

      event.target.value = "";

      return;
    }

    /*
     * Validate file size.
     */
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((currentErrors) => ({
        ...currentErrors,

        banner:
          "Banner image must be smaller than 5 MB.",
      }));

      event.target.value = "";

      return;
    }

    try {
      /*
       * Get actual intrinsic dimensions.
       */
      const dimensions =
        await getImageDimensions(file);

      const { width, height } =
        dimensions;

      const imageAspectRatio =
        width / height;

      const aspectRatioDifference =
        Math.abs(
          imageAspectRatio -
            TARGET_ASPECT_RATIO,
        );

   const isValidWidth =
  width >= MIN_BANNER_WIDTH;

const isValidHeight =
  height >= MIN_BANNER_HEIGHT;

      const isValidAspectRatio =
        aspectRatioDifference <=
        ASPECT_RATIO_TOLERANCE;

      /*
       * Validate banner dimensions.
       */
      if (
        !isValidWidth ||
        !isValidHeight ||
        !isValidAspectRatio
      ) {
        setErrors(
          (currentErrors) => ({
            ...currentErrors,

            banner:
              `Invalid banner size: ${width} × ${height}px. ` +
              "Upload an image close to 1440 × 550px.",
          }),
        );

        event.target.value = "";

        return;
      }

      /*
       * Remove previous temporary preview.
       */
      if (
        bannerPreview.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          bannerPreview,
        );
      }

      const previewUrl =
        URL.createObjectURL(file);

      setBannerPreview(previewUrl);

      setForm((currentForm) => ({
        ...currentForm,

        bannerFile: file,
      }));

      setErrors((currentErrors) => ({
        ...currentErrors,
        banner: "",
      }));

      setServerError("");
    } catch {
      setErrors((currentErrors) => ({
        ...currentErrors,

        banner:
          "Unable to read the selected image.",
      }));

      event.target.value = "";
    }
  };

  /*
   * Validate all event form fields.
   */
  const validateForm = () => {
    const validationErrors = {};

    const title = form.title.trim();

    const location =
      form.location.trim();

    const amount =
      Number(form.amount);

    /*
     * Event title validation.
     */
    if (!title) {
      validationErrors.title =
        "Event title is required.";
    } else if (title.length < 3) {
      validationErrors.title =
        "Event title must contain at least 3 characters.";
    } else if (
      title.length > 150
    ) {
      validationErrors.title =
        "Event title cannot exceed 150 characters.";
    }

    /*
     * Event date validation.
     */
    if (!form.eventDate) {
      validationErrors.eventDate =
        "Event date is required.";
    } else if (
      isPastDate(form.eventDate)
    ) {
      validationErrors.eventDate =
        "Event date cannot be in the past.";
    }

    /*
     * Start time validation.
     */
    if (!form.startTime) {
      validationErrors.startTime =
        "Start time is required.";
    }

    /*
     * End time validation.
     */
    if (!form.endTime) {
      validationErrors.endTime =
        "End time is required.";
    }

    if (
      form.startTime &&
      form.endTime &&
      form.endTime <=
        form.startTime
    ) {
      validationErrors.endTime =
        "End time must be later than the start time.";
    }

    /*
     * Location validation.
     */
    if (!location) {
      validationErrors.location =
        "Event location is required.";
    } else if (
      location.length < 5
    ) {
      validationErrors.location =
        "Enter the complete event location.";
    } else if (
      location.length > 500
    ) {
      validationErrors.location =
        "Location cannot exceed 500 characters.";
    }

    /*
     * Ticket amount validation.
     */
    if (form.amount === "") {
      validationErrors.amount =
        "Ticket amount is required.";
    } else if (
      Number.isNaN(amount)
    ) {
      validationErrors.amount =
        "Enter a valid ticket amount.";
    } else if (amount < 0) {
      validationErrors.amount =
        "Ticket amount cannot be negative.";
    } else if (
      amount > 1000000
    ) {
      validationErrors.amount =
        "Ticket amount cannot exceed ₹10,00,000.";
    }

    /*
     * Banner validation.
     */
    if (
      !form.bannerUrl &&
      !form.bannerFile
    ) {
      validationErrors.banner =
        "Event banner is required.";
    }

    setErrors(validationErrors);

    return (
      Object.keys(
        validationErrors,
      ).length === 0
    );
  };

  /*
   * Create or update event.
   */
  const saveEvent = async (
    status,
  ) => {
    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setSaving(true);
    setSaved(false);
    setServerError("");

    try {
      let bannerUrl =
        form.bannerUrl;

      /*
       * Upload new banner first.
       */
      if (form.bannerFile) {
        const uploadResult =
          await api.uploadBanner(
            form.bannerFile,
          );

        bannerUrl =
          uploadResult.bannerUrl;
      }

      const eventData = {
        title: form.title.trim(),

        eventDate:
          form.eventDate,

        startTime:
          form.startTime,

        endTime:
          form.endTime,

        location:
          form.location.trim(),

        amount:
          Number(form.amount),

        bannerUrl,

        status,
      };

      let savedEvent;

      /*
       * Edit existing event.
       */
      if (eventId) {
        savedEvent =
          await api.updateEvent(
            eventId,
            eventData,
          );
      } else {
        /*
         * Create new event.
         */
        savedEvent =
          await api.createEvent(
            eventData,
          );
      }

      const savedBannerUrl =
        savedEvent.banner_url ||
        savedEvent.bannerUrl ||
        bannerUrl;

      setForm((currentForm) => ({
        ...currentForm,

        bannerUrl:
          savedBannerUrl,

        bannerFile: null,
      }));

      setBannerPreview(
        savedBannerUrl,
      );

      setSaved(true);

      /*
       * Redirect new event to edit page.
       */
      if (!eventId) {
        navigate(
          `/admin/events/${savedEvent.id}/edit`,
          {
            replace: true,
          },
        );
      }

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      setServerError(
        error.message ||
          "Unable to save event.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        Loading event information...
      </div>
    );
  }

  return (
    <>
      <div className="editor-head">
        <Link to="/admin/events">
          <ChevronLeft />

          <span>Back to Events</span>
        </Link>

        <div>
          <button
            type="button"
            className="admin-secondary"
            disabled={saving}
            onClick={() =>
              saveEvent("DRAFT")
            }
          >
            Save as Draft
          </button>

          <button
            type="button"
            className="admin-primary"
            disabled={saving}
            onClick={() =>
              saveEvent("PUBLISHED")
            }
          >
            {saved ? (
              <Check />
            ) : (
              <Save />
            )}

            {saving
              ? "Saving..."
              : saved
                ? "Saved"
                : "Publish Event"}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="form-error">
          {serverError}
        </div>
      )}

      {saved && (
        <div className="save-message">
          Event saved successfully. The
          public website has been updated.
        </div>
      )}

      <section className="admin-panel editor-panel">
        <div className="editor-title">
          <h2>Event Information</h2>

          <p>
            This information will appear
            on the public event page.
          </p>
        </div>

        <div className="form-grid">
          {/* Event title */}

          <Field
            label="Event Title"
            error={errors.title}
            full
          >
            <input
              type="text"
              value={form.title}
              maxLength={150}
              placeholder="Money Pechu Fans Meet Chennai 2026"
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
            />

            <small className="field-counter">
              {form.title.length}/150
            </small>
          </Field>

          {/* Event date */}

          <Field
            label="Event Date"
            error={errors.eventDate}
          >
            <input
              type="date"
              min={getToday()}
              value={form.eventDate}
              onChange={(event) =>
                updateField(
                  "eventDate",
                  event.target.value,
                )
              }
            />
          </Field>

          {/* Ticket amount */}

          <Field
            label="Ticket Amount"
            error={errors.amount}
          >
            <div className="amount-input">
              <span>₹</span>

              <input
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={form.amount}
                placeholder="750"
                onChange={(event) =>
                  updateField(
                    "amount",
                    event.target.value,
                  )
                }
              />
            </div>

            <small className="field-help">
              Enter 0 for a free event.
            </small>
          </Field>

          {/* Start time */}

          <Field
            label="Start Time"
            error={errors.startTime}
          >
            <input
              type="time"
              value={form.startTime}
              onChange={(event) =>
                updateField(
                  "startTime",
                  event.target.value,
                )
              }
            />
          </Field>

          {/* End time */}

          <Field
            label="End Time"
            error={errors.endTime}
          >
            <input
              type="time"
              value={form.endTime}
              onChange={(event) =>
                updateField(
                  "endTime",
                  event.target.value,
                )
              }
            />
          </Field>

          {/* Location */}

          <Field
            label="Event Location"
            error={errors.location}
            full
          >
            <textarea
              rows="4"
              maxLength={500}
              value={form.location}
              placeholder="Muthamizh Peravai, T.N Rajarathinam Kalai Arangam, RA Puram, Chennai - 600028"
              onChange={(event) =>
                updateField(
                  "location",
                  event.target.value,
                )
              }
            />

            <small className="field-counter">
              {form.location.length}/500
            </small>
          </Field>

          {/* Banner */}

          <Field
            label="Event Banner"
            error={errors.banner}
            full
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              hidden
              onChange={
                handleBannerChange
              }
            />

            <div className="banner-upload-box">
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Event banner preview"
                />
              ) : (
                <div className="banner-empty">
                  <Image />

                  <b>
                    No banner selected
                  </b>
                </div>
              )}

              <div className="banner-upload-content">
                <div>
                  <b>
                    Upload Event Banner
                  </b>

                  <small>
                    Recommended: 1440 ×
                    550px
                  </small>

                  <small>
                    Accepted range: 1400–
                    1500px wide
                  </small>

                  <small>
                    Accepted range: 530–
                    570px high
                  </small>

                  <small>
                    JPG, PNG or WebP ·
                    Maximum 5 MB
                  </small>
                </div>

                <button
                  type="button"
                  className="admin-secondary"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <Upload />

                  Choose Banner
                </button>
              </div>
            </div>
          </Field>
        </div>
      </section>
    </>
  );
}

/*
 * Reusable form field.
 */
function Field({
  label,
  error,
  children,
  full = false,
}) {
  return (
    <label
      className={`admin-field ${
        full ? "full" : ""
      }`}
    >
      <span>
        {label}

        <b className="required-mark">
          *
        </b>
      </span>

      {children}

      {error && (
        <small className="field-error">
          {error}
        </small>
      )}
    </label>
  );
}

/*
 * Read actual image dimensions.
 */
function getImageDimensions(file) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new window.Image();

      const imageUrl =
        URL.createObjectURL(file);

      image.onload = () => {
        resolve({
          width:
            image.naturalWidth,

          height:
            image.naturalHeight,
        });

        URL.revokeObjectURL(
          imageUrl,
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(
          imageUrl,
        );

        reject(
          new Error(
            "Invalid image",
          ),
        );
      };

      image.src = imageUrl;
    },
  );
}

/*
 * PostgreSQL date to HTML date.
 */
function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

/*
 * PostgreSQL time to HTML time.
 */
function formatTimeForInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
}

/*
 * Today's date: YYYY-MM-DD.
 */
function getToday() {
  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    today.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * Prevent past event dates.
 */
function isPastDate(dateValue) {
  const selectedDate = new Date(
    `${dateValue}T00:00:00`,
  );

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return selectedDate < today;
}