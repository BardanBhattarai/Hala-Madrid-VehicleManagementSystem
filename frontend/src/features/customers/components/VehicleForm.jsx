import InputField from '../../../shared/components/InputField';

export default function VehicleForm({ vehicle, onChange }) {
  return (
    <>
      <InputField label="Vehicle Number" name="vehicleNumber" value={vehicle.vehicleNumber} onChange={onChange} required />
      <InputField label="Brand" name="brand" value={vehicle.brand} onChange={onChange} required />
      <InputField label="Model" name="model" value={vehicle.model} onChange={onChange} required />
      <InputField label="Vehicle Type (e.g. Sedan, SUV)" name="vehicleType" value={vehicle.vehicleType} onChange={onChange} />
      <InputField label="Manufacture Year" name="manufactureYear" type="number" value={vehicle.manufactureYear} onChange={onChange} required />
      <InputField label="Mileage (km)" name="mileage" type="number" value={vehicle.mileage} onChange={onChange} />
      <InputField label="Last Service Date" name="lastServiceDate" type="date" value={vehicle.lastServiceDate} onChange={onChange} />
    </>
  );
}
