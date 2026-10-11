import residentiel from '../assets/images/services/residentiel.svg';
import commercial from '../assets/images/services/commercial.svg';
import regulier from '../assets/images/services/regulier.svg';
import ponctuel from '../assets/images/services/ponctuel.svg';
import demenagement from '../assets/images/services/demenagement.svg';
import vitres from '../assets/images/services/vitres.svg';
import deneigement from '../assets/images/services/deneigement.svg';
import maintenance from '../assets/images/services/maintenance.svg';

// Illustrations par defaut utilisees quand un service n'a pas d'image
// uploadee (image_url vide) - une correspondance par mot-cle sur le nom.
const RULES = [
  { test: /vitre/i, image: vitres },
  { test: /d[ée]m[ée]nagement/i, image: demenagement },
  { test: /d[ée]neigement|neige/i, image: deneigement },
  { test: /maintenance|travaux/i, image: maintenance },
  { test: /r[ée]gulier|hebdo/i, image: regulier },
  { test: /commercial|bureau/i, image: commercial },
  { test: /r[ée]sidentiel/i, image: residentiel },
];

export function getServiceIllustration(service) {
  const name = service?.name || '';
  const category = service?.category_name || '';
  const haystack = `${name} ${category}`;
  const match = RULES.find((rule) => rule.test.test(haystack));
  return match ? match.image : ponctuel;
}
