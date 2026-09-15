import { CanonicalVideoFacts } from '../../types/ai';
import { CompletePlatformPackage } from '../../types/platform';

export interface FactValidationResult {
  passed: boolean;
  score: number; // 0 to 100
  violations: string[];
}

/**
 * Validates generated platform packages against canonical facts.
 * Catches hallucinated breeds, locations, or false claims.
 */
export function validateFactuality(
  pkg: CompletePlatformPackage,
  facts: CanonicalVideoFacts
): FactValidationResult {
  const violations: string[] = [];

  const combinedText = [
    pkg.youtube.bestTitle,
    pkg.youtube.shortDescription,
    pkg.facebook.headline,
    pkg.facebook.caption,
    pkg.instagram.caption,
  ]
    .join(' ')
    .toLowerCase();

  // 1. Check location hallucination: If video location is null/unknown, flag false location assertions
  if (!facts.location) {
    const commonFalsifiedLocations = ['new york', 'los angeles', 'tokyo', 'london', 'paris', 'mumbai', 'delhi', 'miami', 'chicago'];
    for (const loc of commonFalsifiedLocations) {
      if (combinedText.includes(loc)) {
        const locName = loc.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        violations.push(`Hallucinated location "${locName}" detected, but video location is unestablished.`);
      }
    }
  }

  // 2. Check false breed hallucination: e.g. if subject is Golden Retriever, flag "German Shepherd"
  if (facts.animals.length > 0) {
    const knownAnimal = facts.animals[0].toLowerCase();
    const otherBreeds = ['pitbull', 'german shepherd', 'husky', 'rottweiler', 'poodle', 'chihuahua', 'bulldog'];
    for (const b of otherBreeds) {
      if (!knownAnimal.includes(b) && combinedText.includes(b)) {
        const breedName = b.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        violations.push(`Conflicting animal breed "${breedName}" detected against established fact "${knownAnimal}".`);
      }
    }
  }

  // 3. Check unauthorized celebrity names
  if (facts.people.length === 0) {
    const celebrities = ['mrbeast', 'elon musk', 'cristiano ronaldo', 'messi', 'taylor swift'];
    for (const c of celebrities) {
      if (combinedText.includes(c)) {
        violations.push(`Unverified celebrity claim "${c}" detected without video evidence.`);
      }
    }
  }

  const passed = violations.length === 0;
  const score = Math.max(0, 100 - violations.length * 35);

  return {
    passed,
    score,
    violations,
  };
}
