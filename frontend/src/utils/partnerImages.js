import pronettoyage from '../assets/images/partners/pronettoyage.svg';
import ecoclean from '../assets/images/partners/ecoclean.svg';
import immoplus from '../assets/images/partners/immoplus.svg';

const RULES = [
  { test: /pronettoyage/i, image: pronettoyage },
  { test: /ecoclean/i, image: ecoclean },
  { test: /immo/i, image: immoplus },
];

// Logo par defaut quand le partenaire n'a pas de logo uploade.
export function getPartnerLogo(partner) {
  const match = RULES.find((rule) => rule.test.test(partner?.name || ''));
  return match ? match.image : null;
}
