import Link from "next/link";
import { ArrowDownRight, ArrowRight, MoveUpRight } from "lucide-react";

const categories = [
  {
    number: "01",
    name: "Baggy Jeans",
    detail: "Room to move. Made to stand out.",
    href: "/shop/baggy-jeans",
    style: "category-card--denim",
    mark: "DENIM",
  },
  {
    number: "02",
    name: "T-shirts",
    detail: "The everyday, done differently.",
    href: "/shop/t-shirts",
    style: "category-card--tee",
    mark: "ESSENTIALS",
  },
  {
    number: "03",
    name: "Shirts",
    detail: "A sharper take on laid-back.",
    href: "/shop/shirts",
    style: "category-card--shirt",
    mark: "DAILY FORM",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> THE NEW EVERYDAY</p>
          <h1>Wear your<br /><span>own kind</span> of style.</h1>
          <p className="hero-description">
            Everyday pieces. Unordinary attitude. Find the fits that feel like you.
          </p>
          <Link className="button button--light" href="#collections">
            Explore collection <ArrowRight size={17} />
          </Link>
        </div>
        <div className="hero-side-note">
          <span>STYLE IS PERSONAL</span>
          <span>EST. 2026</span>
        </div>
        <div className="hero-index"><span>01</span> / 03</div>
        <div className="hero-shape hero-shape--one" aria-hidden="true" />
        <div className="hero-shape hero-shape--two" aria-hidden="true" />
        <div className="hero-sticker" aria-hidden="true">OWN<br />YOUR<br />LOOK <ArrowDownRight size={24} /></div>
      </section>

      <section className="ticker" aria-label="Brand message">
        <div className="ticker-track">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index}>FIND YOUR FIT <i>✳</i> MAKE IT YOURS <i>✳</i> REPEAT <i>✳</i></span>
          ))}
        </div>
      </section>

      <section className="collections section-wrap" id="collections">
        <div className="section-heading">
          <div>
            <p className="eyebrow eyebrow--dark">THE LINEUP / 001</p>
            <h2>Pick your<br /><span>uniform.</span></h2>
          </div>
          <p className="section-intro">Three starting points. Countless ways to make them yours.</p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link className={`category-card ${category.style}`} href={category.href} key={category.number}>
              <span className="category-number">{category.number}</span>
              <span className="category-mark">{category.mark}</span>
              <span className="category-bottom">
                <span>
                  <strong>{category.name}</strong>
                  <small>{category.detail}</small>
                </span>
                <span className="category-arrow"><MoveUpRight size={20} /></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="manifesto">
        <p className="eyebrow">A LITTLE LESS ORDINARY</p>
        <p className="manifesto-line">Good clothes don't need to <em>shout.</em><br />They just need to feel <em>right.</em></p>
        <Link href="#collections" className="text-link">Find your next favourite <ArrowRight size={16} /></Link>
      </section>

      <footer className="site-footer">
        <Link className="wordmark wordmark--footer" href="/">STYLISH<span>OWL.</span></Link>
        <span>Built for your everyday rotation.</span>
        <span>© 2026 StylishOwl</span>
      </footer>
    </main>
  );
}
