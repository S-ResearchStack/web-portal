import { SpecColorType } from 'src/styles/theme';

export function getGenderColor(g: string) {
  return (g === 'female' ? 'secondaryViolet' : 'secondarySkyBlue') as SpecColorType;
}
