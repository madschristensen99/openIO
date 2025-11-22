'use client';

import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'month',
      description: 'Perfect for getting started with iO computation',
      features: [
        '10 hours of computation per month',
        'Basic model execution',
        'Community support',
        'Public model hosting',
        'Standard processing speed',
      ],
      cta: 'Get Started',
      ctaLink: '/dapp/builder',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'month',
      description: 'For developers building production applications',
      features: [
        '100 hours of computation per month',
        'Priority model execution',
        'Email support',
        'Private model hosting',
        '2x faster processing',
        'Advanced iO features',
        'API access',
      ],
      cta: 'Start Pro Trial',
      ctaLink: '/dapp/builder',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      description: 'For teams and high-performance workloads',
      features: [
        'Unlimited computation hours',
        'Highest priority execution',
        '24/7 dedicated support',
        'Unlimited private hosting',
        '5x faster processing',
        'All iO features unlocked',
        'Custom API endpoints',
        'Team collaboration tools',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      ctaLink: '/community',
      popular: false,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="pricing-page">
        <div className="pricing-hero">
          <h1 className="pricing-title">Pricing</h1>
          <p className="pricing-subtitle">
            Choose the right plan for your computation needs
          </p>
          <p className="pricing-description">
            Run sealed models, execute iO contracts, and deploy invisible applications with our flexible pricing tiers.
          </p>
        </div>

        <div className="pricing-tiers">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`pricing-tier ${tier.popular ? 'popular' : ''}`}
            >
              {tier.popular && (
                <div className="popular-badge">Most Popular</div>
              )}
              <div className="tier-header">
                <h3 className="tier-name">{tier.name}</h3>
                <div className="tier-price">
                  <span className="price-amount">{tier.price}</span>
                  <span className="price-period">/{tier.period}</span>
                </div>
                <p className="tier-description">{tier.description}</p>
              </div>
              <ul className="tier-features">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="tier-feature">
                    <span className="feature-check">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={tier.ctaLink} className={`tier-cta ${tier.popular ? 'cta-primary' : 'cta-secondary'}`}>
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="pricing-faq">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">What is computation power?</h3>
              <p className="faq-answer">
                Computation power refers to the processing time and resources needed to execute sealed models, 
                run iO contracts, and perform obfuscated computations on our platform.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I upgrade or downgrade?</h3>
              <p className="faq-answer">
                Yes, you can change your plan at any time. Upgrades take effect immediately, 
                while downgrades take effect at the end of your billing cycle.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What happens if I exceed my limit?</h3>
              <p className="faq-answer">
                For Free and Pro plans, computation will pause until the next billing cycle. 
                Enterprise plans have unlimited computation with no interruptions.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do you offer custom plans?</h3>
              <p className="faq-answer">
                Yes, for organizations with specific requirements, we offer custom Enterprise plans. 
                Contact us to discuss your needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

