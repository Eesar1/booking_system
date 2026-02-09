import { useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Calendar,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Clock3,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Briefcase,
  User
} from "lucide-react";
import "./App.css";

const SERVICES = [
  {
    id: "general",
    name: "General Consultation",
    duration: 30,
    price: 30,
    note: "Available today",
    tag: "Popular",
    icon: Stethoscope,
    color: "linear-gradient(135deg, #fb7185, #fb923c)",
    description: "Professional consultation with experienced staff"
  },
  {
    id: "skin",
    name: "Skin Care Session",
    duration: 45,
    price: 45,
    note: "3 slots left",
    tag: "New",
    icon: Sparkles,
    color: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    description: "Refreshing skin treatment for glowing results"
  },
  {
    id: "coaching",
    name: "Business Coaching",
    duration: 60,
    price: 60,
    note: "Weekly schedule",
    tag: "Pro",
    icon: Briefcase,
    color: "linear-gradient(135deg, #34d399, #0ea5a3)",
    description: "One on one growth and strategy guidance"
  },
  {
    id: "salon",
    name: "Salon Services",
    duration: 90,
    price: 75,
    note: "Book early",
    tag: "Trending",
    icon: Scissors,
    color: "linear-gradient(135deg, #f472b6, #fb7185)",
    description: "Premium hair and beauty services"
  }
];

const TIME_SLOTS = [
  { time: "09:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "12:00 PM", available: true },
  { time: "02:00 PM", available: true },
  { time: "03:00 PM", available: true },
  { time: "04:00 PM", available: false },
  { time: "05:00 PM", available: true }
];

const generateCalendarDays = () => {
  const today = new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      id: date.toISOString().split("T")[0],
      date: date.getDate(),
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date,
      isToday: index === 0
    };
  });
};

const formatDisplayDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
};

function App() {
  const calendarDays = useMemo(() => generateCalendarDays(), []);
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES[0].id);
  const [selectedDate, setSelectedDate] = useState(calendarDays[0]?.id || "");
  const [selectedTime, setSelectedTime] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [highlightAvailability, setHighlightAvailability] = useState(false);

  const availabilityRef = useRef(null);
  const highlightTimer = useRef(null);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      notes: ""
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full name is required"),
      email: Yup.string().email("Enter a valid email").required("Email is required"),
      phone: Yup.string().matches(/^[\+\d\s\-()]*$/, "Enter a valid phone number").required("Phone is required"),
      notes: Yup.string()
    }),
    validateOnMount: false,
    onSubmit: () => {}
  });

  const selectedService = SERVICES.find((service) => service.id === selectedServiceId);
  const SummaryIcon = selectedService ? selectedService.icon : null;
  const serviceTax = selectedService ? selectedService.price * 0.1 : 0;
  const serviceTotal = selectedService ? selectedService.price + serviceTax : 0;
  const firstAvailableTime = TIME_SLOTS.find((slot) => slot.available)?.time || "--";

  const step1Complete = Boolean(selectedServiceId);
  const step2Complete = Boolean(selectedDate && selectedTime);
  const step3Complete = Boolean(
    formik.values.fullName.trim() &&
      formik.values.email.trim() &&
      !formik.errors.fullName &&
      !formik.errors.email
  );

  const canConfirm = step1Complete && step2Complete && step3Complete;

  const steps = [
    { id: 1, label: "Choose Service", complete: step1Complete },
    { id: 2, label: "Pick Date and Time", complete: step2Complete },
    { id: 3, label: "Your Details", complete: step3Complete }
  ];

  const handleDateSelect = (dateId) => {
    setSelectedDate(dateId);
    setSelectedTime("");
  };

  const scrollToAvailability = () => {
    availabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightAvailability(true);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightAvailability(false), 1400);
  };

  const handleConfirm = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length) {
      formik.setTouched({
        fullName: true,
        email: true,
        phone: true,
        notes: true
      });
      setCurrentStep(3);
      return;
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedServiceId(SERVICES[0].id);
    setSelectedDate(calendarDays[0]?.id || "");
    setSelectedTime("");
    formik.resetForm();
    setCurrentStep(1);
    setShowModal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <nav className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__icon">
              <CalendarCheck size={16} />
            </span>
            <span className="brand__name">BookEasy</span>
          </div>
          <span className="status-pill">
            <span className="status-dot" />
            Open Now
          </span>
        </div>
      </nav>

      <main className="shell">
        <section className="hero">
          <div className="hero__content">
            <span className="hero__tag">
              <Sparkles size={14} />
              Local Business Appointment
            </span>
            <h1>
              Book your
              <span className="hero__accent"> perfect time</span>
            </h1>
            <p>
              Experience seamless appointment booking with real time availability.
              No more waiting, no more hassle.
            </p>
            <div className="hero__stats">
              <div className="stat">
                <span className="stat__icon stat__icon--amber">
                  <TrendingUp size={18} />
                </span>
                <div>
                  <strong>92%</strong>
                  <span>Return rate</span>
                </div>
              </div>
              <div className="stat">
                <span className="stat__icon stat__icon--violet">
                  <Star size={18} />
                </span>
                <div>
                  <strong>4.9/5</strong>
                  <span>Client rating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero__card">
            <div className="hero__card-header">
              <span className="pulse-dot" />
              Next available
            </div>
            <div className="hero__card-main">
              <p className="hero__card-date">{formatDisplayDate(selectedDate)}</p>
              <p className="hero__card-time">
                {selectedTime || firstAvailableTime}
              </p>
            </div>
            <button className="primary-btn" type="button" onClick={scrollToAvailability}>
              Check availability
              <ChevronRight size={16} />
            </button>
            <div className="hero__card-footer">
              <div>
                <Shield size={14} /> Secure booking
              </div>
              <div>
                <Heart size={14} /> Trusted by 10K+
              </div>
            </div>
          </div>
        </section>

        <section className="steps">
          <div className="steps__track">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`step ${
                  currentStep === step.id ? "active" : step.complete ? "complete" : ""
                }`}
              >
                <span className="step__icon">
                  {step.complete && currentStep !== step.id ? (
                    <Check size={14} />
                  ) : (
                    step.id
                  )}
                </span>
                <span className="step__label">{step.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="content">
          <div className="content__main">
            <section className="card">
              <header className="card__header">
                <span className="card__icon card__icon--orange">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h2>Select a service</h2>
                  <p>Choose the service you want to book</p>
                </div>
              </header>
              <div className="card__body">
                <div className="service-grid">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        className={`service-card ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          setCurrentStep(2);
                        }}
                      >
                        <span className="service-card__check">
                          {isSelected ? <Check size={14} /> : null}
                        </span>
                        <span
                          className="service-card__icon"
                          style={{ background: service.color }}
                        >
                          <Icon size={18} />
                        </span>
                        <div className="service-card__info">
                          <div className="service-card__title">
                            <h3>{service.name}</h3>
                            <span className={`tag tag--${service.tag.toLowerCase()}`}>
                              {service.tag}
                            </span>
                          </div>
                          <p>{service.description}</p>
                          <div className="service-card__meta">
                            <span>
                              <Clock3 size={12} /> {service.duration} min
                            </span>
                            <span className="price">${service.price}</span>
                            <span>{service.note}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section
              ref={availabilityRef}
              className={`card ${highlightAvailability ? "highlight" : ""}`}
            >
              <header className="card__header">
                <span className="card__icon card__icon--violet">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <h2>Choose date and time</h2>
                  <p>Select your preferred appointment slot</p>
                </div>
              </header>
              <div className="card__body">
                <div className="section">
                  <p className="section__label">Select date</p>
                  <div className="date-strip scrollbar-hide">
                    {calendarDays.map((day) => {
                      const isSelected = selectedDate === day.id;
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => handleDateSelect(day.id)}
                          className={`date-card ${isSelected ? "selected" : ""}`}
                        >
                          <span>{day.dayName}</span>
                          <strong>{day.date}</strong>
                          <small>{day.month}</small>
                          {day.isToday ? <em>Today</em> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="divider" />

                <div className="section">
                  <p className="section__label">Select time</p>
                  <div className="time-grid">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          className={`time-slot ${
                            slot.available ? "" : "disabled"
                          } ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            if (!slot.available) return;
                            setSelectedTime(slot.time);
                            setCurrentStep(3);
                          }}
                        >
                          <Clock size={14} />
                          {slot.time}
                          {!slot.available ? <span className="slot-x">x</span> : null}
                        </button>
                      );
                    })}
                  </div>
                  <div className="legend">
                    <span><i className="dot dot--available" /> Available</span>
                    <span><i className="dot dot--selected" /> Selected</span>
                    <span><i className="dot dot--booked" /> Booked</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <header className="card__header">
                <span className="card__icon card__icon--teal">
                  <User size={18} />
                </span>
                <div>
                  <h2>Your details</h2>
                  <p>We will send confirmation to these details</p>
                </div>
              </header>
              <div className="card__body">
                <form className="form" onSubmit={formik.handleSubmit}>
                  <div className="form__grid">
                    <label className="field">
                      <span >
                        Full name <span className="field__required">*</span>
                      </span>
                      <div className={`field__control ${formik.touched.fullName && formik.errors.fullName ? "error" : ""}`}>
                        <User size={14} />
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Enter Your Name"
                          value={formik.values.fullName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      {formik.touched.fullName && formik.errors.fullName ? (
                        <span className="error-text">{formik.errors.fullName}</span>
                      ) : null}
                    </label>

                    <label className="field">
                      <span >
                        Email <span className="field__required">*</span>
                      </span>
                      <div className={`field__control ${formik.touched.email && formik.errors.email ? "error" : ""}`}>
                        <Mail size={14} />
                        <input
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      {formik.touched.email && formik.errors.email ? (
                        <span className="error-text">{formik.errors.email}</span>
                      ) : null}
                    </label>

                    <label className="field">
                      <span >
                        Phone <span className="field__required">*</span>
                      </span>
                      <div className="field__control">
                        <Phone size={14} />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+92 123 4567890"
                          value={formik.values.phone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      {formik.touched.phone && formik.errors.phone ? (
                        <span className="error-text">{formik.errors.phone}</span>
                      ) : null}
                    </label>

                    <label className="field field--full">
                      Notes
                      <div className="field__control">
                        <FileText size={14} />
                        <textarea
                          name="notes"
                          placeholder="Any special requests or notes for your appointment"
                          value={formik.values.notes}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                    </label>
                  </div>
                </form>
              </div>
            </section>
          </div>

          <aside className="content__side">
            <div className="summary-card">
              <div className="summary-card__header">
                <Calendar size={18} />
                Booking summary
              </div>
              {selectedService ? (
                <div className="summary-card__body">
                  <div className="summary-line">
                    <span
                      className="summary-icon"
                      style={{ background: selectedService.color }}
                    >
                      {SummaryIcon ? <SummaryIcon size={16} /> : null}
                    </span>
                    <div>
                      <strong>{selectedService.name}</strong>
                      <p>{selectedService.duration} minutes</p>
                    </div>
                  </div>
                  <div className="summary-line">
                    <span className="summary-icon summary-icon--violet">
                      <CalendarDays size={16} />
                    </span>
                    <div>
                      <strong>{formatDisplayDate(selectedDate)}</strong>
                      <p>{selectedTime || "Select a time"}</p>
                    </div>
                  </div>
                  <div className="summary-divider" />
                  <div className="summary-row">
                    <span>Service fee</span>
                    <span>${selectedService.price.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax</span>
                    <span>${serviceTax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row summary-total">
                    <span>Total</span>
                    <span>${serviceTotal.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="summary-empty">Select a service to see details</p>
              )}
              <div className="summary-card__footer">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className={`primary-btn ${canConfirm ? "" : "disabled"}`}
                >
                  {canConfirm ? (
                    <>
                      Confirm booking
                      <ChevronRight size={16} />
                    </>
                  ) : (
                    "Complete all steps"
                  )}
                </button>
                <div className="summary-meta">
                  <span><Shield size={14} /> Secure</span>
                  <span><MapPin size={14} /> Local business</span>
                </div>
              </div>
            </div>

            <div className="trust-grid">
              <div className="trust-card">
                <span className="trust-icon trust-icon--green">
                  <Check size={16} />
                </span>
                <p>Instant confirm</p>
              </div>
              <div className="trust-card">
                <span className="trust-icon trust-icon--blue">
                  <Calendar size={16} />
                </span>
                <p>Free reschedule</p>
              </div>
              <div className="trust-card">
                <span className="trust-icon trust-icon--rose">
                  <Heart size={16} />
                </span>
                <p>Satisfaction</p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {showModal ? (
        <div className="modal">
          <div className="modal__backdrop" onClick={() => setShowModal(false)} />
          <div className="modal__content" role="dialog" aria-modal="true">
            <div className="modal__icon">
              <Check size={28} />
            </div>
            <h3>Booking confirmed</h3>
            <p>Your appointment has been successfully scheduled.</p>
            <div className="modal__summary">
              <div>
                <strong>{selectedService?.name}</strong>
                <span>
                  {selectedService?.duration} min - ${selectedService?.price}
                </span>
              </div>
              <div>
                <CalendarDays size={16} />
                <span>{formatDisplayDate(selectedDate)}</span>
              </div>
              <div>
                <Clock size={16} />
                <span>{selectedTime || firstAvailableTime}</span>
              </div>
              {formik.values.notes ? (
                <div>
                  <FileText size={16} />
                  <span>{formik.values.notes}</span>
                </div>
              ) : null}
            </div>
            <div className="modal__actions">
              <button type="button" className="ghost-btn" onClick={() => setShowModal(false)}>
                Edit booking
              </button>
              <button type="button" className="primary-btn" onClick={resetForm}>
                New booking
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
