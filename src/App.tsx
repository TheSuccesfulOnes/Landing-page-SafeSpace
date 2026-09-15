import {
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import "./App.css";

type Audience = "employees" | "humanResources";
type Currency = "PEN" | "USD";

const teamMembers = [
  { key: "member01", image: "/media/team/member-01.png" },
  { key: "member02", image: "/media/team/member-02.png" },
  { key: "member03", image: "/media/team/member-03.png" },
  { key: "member04", image: "/media/team/member-04.png" },
  { key: "member05", image: "/media/team/member-05.png" },
] as const;

function App() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState("home");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(
    null,
  );
  const [hoveredAudience, setHoveredAudience] = useState<Audience | null>(
    null,
  );
  const [activeTeamMember, setActiveTeamMember] = useState(0);
  const [isTeamPaused, setIsTeamPaused] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const currentLanguage = i18n.resolvedLanguage?.startsWith("en") ? "en" : "es";
  const isEnglish = currentLanguage === "en";
  const [currency, setCurrency] = useState<Currency>("PEN");
  const brandKicker = t("brand.kicker", {
    defaultValue: isEnglish ? "Employee wellbeing" : "Bienestar laboral",
  });

  const planPriceFormatter = new Intl.NumberFormat(
    isEnglish ? "en-US" : "es-PE",
    {
      minimumFractionDigits: currency === "USD" ? 2 : 0,
      maximumFractionDigits: currency === "USD" ? 2 : 0,
    },
  );

  const plans = [
    {
      key: "monthly",
      price: currency === "PEN" ? 20 : 5.33,
      featured: false,
    },
    {
      key: "annual",
      price: currency === "PEN" ? 150 : 40,
      featured: true,
    },
  ] as const;

  useEffect(() => {
    if (reduceMotion || isTeamPaused) {
      return undefined;
    }

    const teamRotation = window.setInterval(() => {
      setActiveTeamMember((currentMember) =>
        (currentMember + 1) % teamMembers.length,
      );
    }, 20000);

    return () => window.clearInterval(teamRotation);
  }, [isTeamPaused, reduceMotion]);

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () =>
      mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const sectionIds = [
      "home",
      "about",
      "employees-and-companies",
      "plans",
      "contact",
      "about-team",
    ];
    const sections = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];

        if (visibleSection) {
          setActiveSection(visibleSection.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleLanguageChange = (language: "es" | "en") => {
    void i18n.changeLanguage(language);
  };

  const handleHomeNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActiveSection("home");
    window.history.replaceState(null, "", "#home");
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const visibleAudience = hoveredAudience ?? selectedAudience;

  const handleAudienceSelection = (audience: Audience) => {
    setHoveredAudience(null);
    setSelectedAudience((currentAudience) =>
      currentAudience === audience ? null : audience,
    );
  };

  const handleAudienceKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    audience: Audience,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAudienceSelection(audience);
    }
  };

  const moveTeamMember = (direction: 1 | -1) => {
    setActiveTeamMember((currentMember) => {
      const nextMember = currentMember + direction;

      return (nextMember + teamMembers.length) % teamMembers.length;
    });
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactSubmitted(true);
    event.currentTarget.reset();
  };

  const handleTeamBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    setIsTeamPaused(false);
  };

  const currentTeamMember = teamMembers[activeTeamMember];

  return (
    <div className="app-container">
      <header className="header-app">
        <div className="header-inner">
          <a
            className="brand-link"
            href="#home"
            aria-label="SafeSpace"
            onClick={handleHomeNavigation}
          >
            <span className="brand-mark" aria-hidden="true">
              <img className="logo-header" src="/Logo_SafeSpace.png" alt="" />
            </span>
            <span className="brand-copy">
              <span className="brand-name">SafeSpace</span>
              <span className="brand-kicker">{brandKicker}</span>
            </span>
          </a>

          <nav className="nav-header" aria-label={t("header.navigation")}>
            <ul>
              <li>
                <a
                  className={
                    activeSection === "home" ? "nav-link active" : "nav-link"
                  }
                  href="#home"
                  onClick={handleHomeNavigation}
                  aria-current={
                    activeSection === "home" ? "location" : undefined
                  }
                >
                  {t("header.home")}
                </a>
              </li>
              <li>
                <a
                  className={
                    activeSection === "about" ? "nav-link active" : "nav-link"
                  }
                  href="#about"
                  onClick={() => setActiveSection("about")}
                  aria-current={
                    activeSection === "about" ? "location" : undefined
                  }
                >
                  {t("header.about")}
                </a>
              </li>
              <li>
                <a
                  className={
                    activeSection === "employees-and-companies"
                      ? "nav-link active"
                      : "nav-link"
                  }
                  href="#employees-and-companies"
                  onClick={() => setActiveSection("employees-and-companies")}
                  aria-current={
                    activeSection === "employees-and-companies"
                      ? "location"
                      : undefined
                  }
                >
                  {t("header.employeesAndCompanies")}
                </a>
              </li>
              <li>
                <a
                  className={
                    activeSection === "plans" ? "nav-link active" : "nav-link"
                  }
                  href="#plans"
                  onClick={() => setActiveSection("plans")}
                  aria-current={
                    activeSection === "plans" ? "location" : undefined
                  }
                >
                  {t("header.plans")}
                </a>
              </li>
              <li>
                <a
                  className={
                    activeSection === "contact" ? "nav-link active" : "nav-link"
                  }
                  href="#contact"
                  onClick={() => setActiveSection("contact")}
                  aria-current={
                    activeSection === "contact" ? "location" : undefined
                  }
                >
                  {t("header.contact")}
                </a>
              </li>
              <li>
                <a
                  className={
                    activeSection === "about-team"
                      ? "nav-link active"
                      : "nav-link"
                  }
                  href="#about-team"
                  onClick={() => setActiveSection("about-team")}
                  aria-current={
                    activeSection === "about-team" ? "location" : undefined
                  }
                >
                  {t("header.aboutTeam")}
                </a>
              </li>
            </ul>
          </nav>

          <div className="header-tools">
            <a className="header-login" href="#login">
              {t("header.signIn")}
            </a>
            <a className="header-register" href="#register">
              {t("header.register")}
            </a>
            <div
              className="language-control"
              role="group"
              aria-label={t("header.languageSwitcher")}
            >
              <button
                type="button"
                className={!isEnglish ? "selected" : ""}
                onClick={() => handleLanguageChange("es")}
                aria-pressed={!isEnglish}
                title={t("header.spanish")}
              >
                ES
              </button>
              <button
                type="button"
                className={isEnglish ? "selected" : ""}
                onClick={() => handleLanguageChange("en")}
                aria-pressed={isEnglish}
                title={t("header.english")}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-app">
        <section id="home" className="home-hero" aria-labelledby="home-title">
          <video
            className="home-hero-video"
            autoPlay={!reduceMotion}
            loop
            muted
            playsInline
            preload="metadata"
            poster="/Logo_SafeSpace.png"
            aria-hidden="true"
          >
            <source src="/media/safespace-hero.mp4" type="video/mp4" />
          </video>
          <div className="home-hero-overlay" aria-hidden="true" />
          <div className="home-hero-content">
            <h1 id="home-title">{t("home.title")}</h1>
            <p>{t("home.description")}</p>
          </div>
        </section>

        <section
          id="about"
          className="about-section product-section"
          aria-labelledby="about-title"
        >
          <div className="product-inner">
            <div className="product-layout">
              <div className="product-copy">
                <p className="section-eyebrow">{t("about.eyebrow")}</p>
                <h2 id="about-title">{t("about.title")}</h2>
                <p className="product-lead">{t("about.lead")}</p>
                <p className="product-body">{t("about.body")}</p>
              </div>

              <div
                className="product-visual"
                role="group"
                aria-label={t("about.visualLabel")}
              >
                <figure className="product-preview product-preview--desktop product-preview--back">
                  <div className="device-laptop">
                    <div className="device-laptop-camera" aria-hidden="true" />
                    <div className="device-laptop-screen">
                      <img
                        src="/media/how-it-works/web-hr-summary.svg"
                        alt={t("about.visualAlt.webHr")}
                        loading="lazy"
                      />
                    </div>
                    <div className="device-laptop-base" />
                  </div>
                </figure>
                <figure className="product-preview product-preview--desktop product-preview--front">
                  <div className="device-laptop">
                    <div className="device-laptop-camera" aria-hidden="true" />
                    <div className="device-laptop-screen">
                      <img
                        src="/media/how-it-works/web-employee-home.svg"
                        alt={t("about.visualAlt.webEmployee")}
                        loading="lazy"
                      />
                    </div>
                    <div className="device-laptop-base" />
                  </div>
                </figure>
                <div className="product-preview-mobile-group">
                  <figure className="product-preview product-preview--mobile product-preview--mobile-back">
                    <div className="device-phone">
                      <div className="device-phone-speaker" aria-hidden="true" />
                      <div className="device-phone-screen">
                        <img
                          src="/media/how-it-works/mobile-hr-summary.svg"
                          alt={t("about.visualAlt.mobileHr")}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </figure>
                  <figure className="product-preview product-preview--mobile product-preview--mobile-front">
                    <div className="device-phone">
                      <div className="device-phone-speaker" aria-hidden="true" />
                      <div className="device-phone-screen">
                        <img
                          src="/media/how-it-works/mobile-employee-home.svg"
                          alt={t("about.visualAlt.mobileEmployee")}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="employees-and-companies"
          className="landing-section audience-section"
          aria-labelledby="employees-and-companies-title"
        >
          <div className="landing-section-inner">
            <div className="landing-section-content audience-section-heading">
              <p className="section-eyebrow">
                {t("sections.employeesAndCompanies.eyebrow")}
              </p>
              <h2 id="employees-and-companies-title">
                {t("sections.employeesAndCompanies.title")}
              </h2>
              <p>{t("sections.employeesAndCompanies.description")}</p>
            </div>

            <div
              onMouseLeave={() => setHoveredAudience(null)}
              className={`audience-benefits ${
                visibleAudience ? `has-${visibleAudience}` : "has-none"
              }`}
            >
              <article
                className={`audience-panel audience-panel--employees ${
                  visibleAudience === "employees"
                    ? "is-active"
                    : visibleAudience
                      ? "is-inactive"
                      : "is-idle"
                }`}
                tabIndex={0}
                role="button"
                aria-pressed={selectedAudience === "employees"}
                aria-expanded={visibleAudience === "employees"}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setHoveredAudience("employees");
                }}
                onClick={() => handleAudienceSelection("employees")}
                onKeyDown={(event) =>
                  handleAudienceKeyDown(event, "employees")
                }
              >
                <div className="audience-panel-content">
                  <div className="audience-panel-header">
                    <p className="audience-panel-label">
                      {t("sections.employeesAndCompanies.employees.label")}
                    </p>
                  </div>
                  <h3>{t("sections.employeesAndCompanies.employees.title")}</h3>
                  <div className="audience-panel-details" aria-hidden={visibleAudience !== "employees"}>
                    <div className="audience-panel-details-inner">
                    <p className="audience-panel-description">
                      {t("sections.employeesAndCompanies.employees.description")}
                    </p>
                    <ul className="audience-panel-benefits">
                      <li>
                        <span
                          className="audience-benefit-mark"
                          aria-hidden="true"
                        />
                        {t(
                          "sections.employeesAndCompanies.employees.benefits.expression",
                        )}
                      </li>
                      <li>
                        <span
                          className="audience-benefit-mark"
                          aria-hidden="true"
                        />
                        {t(
                          "sections.employeesAndCompanies.employees.benefits.guidance",
                        )}
                      </li>
                      <li>
                        <span
                          className="audience-benefit-mark"
                          aria-hidden="true"
                        />
                        {t(
                          "sections.employeesAndCompanies.employees.benefits.privacy",
                        )}
                      </li>
                    </ul>
                  </div>
                  </div>
                </div>
              </article>

              <article
                className={`audience-panel audience-panel--human-resources ${
                  visibleAudience === "humanResources"
                    ? "is-active"
                    : visibleAudience
                      ? "is-inactive"
                      : "is-idle"
                }`}
                tabIndex={0}
                role="button"
                aria-pressed={selectedAudience === "humanResources"}
                aria-expanded={visibleAudience === "humanResources"}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setHoveredAudience("humanResources");
                }}
                onClick={() => handleAudienceSelection("humanResources")}
                onKeyDown={(event) =>
                  handleAudienceKeyDown(event, "humanResources")
                }
              >
                <div className="audience-panel-content">
                  <div className="audience-panel-header">
                    <p className="audience-panel-label">
                      {t(
                        "sections.employeesAndCompanies.humanResources.label",
                      )}
                    </p>
                  </div>
                  <h3>
                    {t("sections.employeesAndCompanies.humanResources.title")}
                  </h3>
                  <div className="audience-panel-details" aria-hidden={visibleAudience !== "humanResources"}>
                    <div className="audience-panel-details-inner">
                    <p className="audience-panel-description">
                      {t(
                        "sections.employeesAndCompanies.humanResources.description",
                      )}
                    </p>
                    <ul className="audience-panel-benefits">
                      <li>
                        <span
                          className="audience-benefit-mark"
                          aria-hidden="true"
                        />
                        {t(
                          "sections.employeesAndCompanies.humanResources.benefits.listen",
                        )}
                      </li>
                      <li>
                        <span
                          className="audience-benefit-mark"
                          aria-hidden="true"
                        />
                        {t(
                          "sections.employeesAndCompanies.humanResources.benefits.signals",
                        )}
                      </li>
                      <li>
                        <span
                          className="audience-benefit-mark"
                          aria-hidden="true"
                        />
                        {t(
                          "sections.employeesAndCompanies.humanResources.benefits.action",
                        )}
                      </li>
                    </ul>
                  </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          id="plans"
          className="landing-section landing-section--light"
          aria-labelledby="plans-title"
        >
          <div className="landing-section-inner">
            <div className="landing-section-content landing-section-content--compact">
              <p className="section-eyebrow">{t("sections.plans.eyebrow")}</p>
              <h2 id="plans-title">{t("sections.plans.title")}</h2>
              <p>{t("sections.plans.description")}</p>
              <div className="landing-section-note">
                {t("sections.comingSoon")}
              </div>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="landing-section"
          aria-labelledby="contact-title"
        >
          <div className="landing-section-inner">
            <div className="landing-section-content landing-section-content--compact">
              <p className="section-eyebrow">{t("sections.contact.eyebrow")}</p>
              <h2 id="contact-title">{t("sections.contact.title")}</h2>
              <p>{t("sections.contact.description")}</p>
              <div className="landing-section-note">
                {t("sections.comingSoon")}
              </div>
            </div>
          </div>
        </section>

        <section
          id="about-team"
          className="landing-section landing-section--light"
          aria-labelledby="about-team-title"
        >
          <div className="landing-section-inner">
            <div className="landing-section-content landing-section-content--compact">
              <p className="section-eyebrow">
                {t("sections.aboutTeam.eyebrow")}
              </p>
              <h2 id="about-team-title">{t("sections.aboutTeam.title")}</h2>
              <p>{t("sections.aboutTeam.description")}</p>
              <div className="landing-section-note">
                {t("sections.comingSoon")}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-app">
        <div className="footer-inner">
          <div className="footer-brand-block">
            <a
              className="footer-brand"
              href="#home"
              aria-label="SafeSpace"
              onClick={handleHomeNavigation}
            >
              <span className="footer-brand-mark" aria-hidden="true">
                <img src="/Logo_SafeSpace.png" alt="" />
              </span>
              <span>SafeSpace</span>
            </a>
            <p className="footer-description">{t("footer.description")}</p>
          </div>

          <nav
            className="footer-navigation"
            aria-label={t("footer.navigation")}
          >
            <a href="#privacy">{t("footer.privacy")}</a>
            <a href="#terms">{t("footer.terms")}</a>
            <a href="#ai-policy">{t("footer.aiPolicy")}</a>
            <a href="#support">{t("footer.support")}</a>
          </nav>

          <div className="footer-meta">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
