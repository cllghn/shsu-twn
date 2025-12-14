export const convertGallonsToAcreFeet = (gallons: number): number => {
  const GALLONS_PER_ACRE_FOOT = 325851;
  return gallons / GALLONS_PER_ACRE_FOOT;
};

export const formatVolume = (
  gallons: number, 
  isAcreFeet: boolean, 
  decimals: number = 2
): string => {
  if (isAcreFeet) {
    const acreFeet = convertGallonsToAcreFeet(gallons);
    return acreFeet.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  }
  return gallons.toLocaleString();
};

export const getVolumeUnit = (isAcreFeet: boolean): string => {
  return isAcreFeet ? 'acre-ft' : 'gal';
};