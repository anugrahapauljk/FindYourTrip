// Configurable travel pricing and mileage guidelines for Indian travel (in INR)
export const TRANSPORT_CONFIG = {
  car: {
    mileage: 15, // km/L
    fuelPrice: 105, // per L
  },
  bike: {
    mileage: 40, // km/L
    fuelPrice: 105, // per L
  },
  bus: {
    costPerKm: 2.5, // per km
  },
  train: {
    costPerKm: 1.8, // per km
  },
  flight: {
    baseFare: 3000,
    costPerKm: 2.0,
  }
};

/**
 * Calculates programmatic transportation cost based on distance and mode
 * @param {number} distanceValueKm - Travel distance in kilometers
 * @param {string} mode - Mode of travel ('car', 'bike', 'bus', 'train', 'flight')
 * @returns {number} Estimated cost in INR (rounded)
 */
export function calculateTransportCost(distanceValueKm, mode = 'car') {
  const normMode = (mode || '').toLowerCase().trim();
  const distance = Math.max(0, Number(distanceValueKm) || 0);

  switch (normMode) {
    case 'car': {
      const { mileage, fuelPrice } = TRANSPORT_CONFIG.car;
      return Math.round((distance / mileage) * fuelPrice);
    }
    case 'bike': {
      const { mileage, fuelPrice } = TRANSPORT_CONFIG.bike;
      return Math.round((distance / mileage) * fuelPrice);
    }
    case 'bus': {
      const { costPerKm } = TRANSPORT_CONFIG.bus;
      return Math.round(distance * costPerKm);
    }
    case 'train': {
      const { costPerKm } = TRANSPORT_CONFIG.train;
      return Math.round(distance * costPerKm);
    }
    case 'flight': {
      const { baseFare, costPerKm } = TRANSPORT_CONFIG.flight;
      // Flights are usually only feasible for longer distances; let's model a dynamic fare
      return Math.round(baseFare + (distance * costPerKm));
    }
    default:
      // Fallback to car
      return Math.round((distance / TRANSPORT_CONFIG.car.mileage) * TRANSPORT_CONFIG.car.fuelPrice);
  }
}
