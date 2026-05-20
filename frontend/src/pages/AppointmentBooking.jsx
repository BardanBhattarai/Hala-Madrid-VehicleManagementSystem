import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentApi from '../services/appointmentApi';
import { getAllCustomers, getCustomerVehicles } from '../features/customers/api/customerApi';
import InputField from '../shared/components/InputField';
import Button from '../shared/components/Button';
import AlertMessage from '../shared/components/AlertMessage';
import { useAuth } from '../shared/context/AuthContext';
import {
  CalendarPlus, User, Car, Wrench,
  FileText, Loader2, CheckCircle, AlertCircle,
  Clock, Calendar, ChevronDown, Sparkles
} from 'lucide-react';

const SERVICE_TYPES = [
  'Full Service',
  'Oil Change',
  'Brake Inspection',
  'Tire Replacement',
  'Engine Diagnostic',
  'Battery Replacement',
  'AC Repair',
  'Transmission Service',
  'Wheel Alignment',
  'Body Repair',
  'General Checkup',
  'Other'
];

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data states
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    appointmentDate: '',
    serviceType: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // UI states
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      if (user?.role === 'Customer') {
        if (user.customerId) {
          setFormData(prev => ({ ...prev, customerId: user.customerId.toString() }));
          setCustomers([{ id: user.customerId, fullName: user.fullName }]);
        }
        setPageLoading(false);
        return;
      }

      try {
        const res = await getAllCustomers();
        setCustomers(res.data.data?.items || res.data.data || res.data || []);
      } catch {
        setError('Failed to load customers. Please ensure the backend is running.');
      } finally {
        setPageLoading(false);
      }
    };
    loadCustomers();
  }, [user]);

  // Fetch vehicles when customer changes
  useEffect(() => {
    if (!formData.customerId) {
      setVehicles([]);
      setFormData(prev => ({ ...prev, vehicleId: '' }));
      return;
    }

    const loadVehicles = async () => {
      setVehiclesLoading(true);
      try {
        const res = await getCustomerVehicles(formData.customerId);
        const vehicleData = res.data.data || res.data;
        setVehicles(vehicleData);
        // Auto-select if only one vehicle
        if (vehicleData.length === 1) {
          setFormData(prev => ({ ...prev, vehicleId: vehicleData[0].id.toString() }));
        } else {
          setFormData(prev => ({ ...prev, vehicleId: '' }));
        }
      } catch {
        setVehicles([]);
      } finally {
        setVehiclesLoading(false);
      }
    };
    loadVehicles();
  }, [formData.customerId]);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Please select a customer.';
    }
    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Please select a vehicle.';
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required.';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      if (selectedDate <= new Date()) {
        newErrors.appointmentDate = 'Appointment date must be in the future.';
      }
    }
    if (!formData.serviceType) {
      newErrors.serviceType = 'Please select a service type.';
    }
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    setLoading(true);
    try {
      await appointmentApi.createAppointment({
        customerId: parseInt(formData.customerId),
        vehicleId: parseInt(formData.vehicleId),
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        serviceType: formData.serviceType,
        notes: formData.notes || null
      });
      setSuccess('Appointment booked successfully! Redirecting...');
      setFormData({ customerId: '', vehicleId: '', appointmentDate: '', serviceType: '', notes: '' });
      setErrors({});
      setTimeout(() => navigate('/customer/appointments'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors
          ? Object.values(err.response?.data?.errors || {}).flat().join(' ')
          : 'Failed to book appointment. Please check your data and try again.';
      setError(typeof msg === 'string' ? msg : 'Failed to book appointment. Please check your data and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Minimum date = tomorrow
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  const selectedCustomer = customers.find(c => c.id === parseInt(formData.customerId));
  const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));

  if (pageLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-lg">Loading booking form...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <CalendarPlus className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Book Appointment</h1>
          <p className="text-slate-500 font-medium">Schedule a new service appointment for a customer's vehicle.</p>
        </div>
      </div>

      {/* ─── Alerts ──────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ─── Customer & Vehicle Selection ───────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Customer & Vehicle
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Select */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                {user?.role === 'Customer' ? (
                  <input
                    type="text"
                    readOnly
                    value={user.fullName}
                    className="w-full pl-12 pr-6 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed"
                  />
                ) : (
                  <>
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-6 py-3.5 bg-slate-50 border ${errors.customerId ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer`}
                    >
                      <option value="">Select a customer...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} | {c.phoneNumber}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                  </>
                )}
              </div>
              {errors.customerId && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.customerId}</p>
              )}
            </div>

            {/* Vehicle Select */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Vehicle <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Car className="absolute left-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                {vehiclesLoading ? (
                  <div className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-slate-400 text-sm font-medium">Loading vehicles...</span>
                  </div>
                ) : (
                  <select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    disabled={!formData.customerId || vehicles.length === 0}
                    className={`w-full pl-12 pr-6 py-3.5 bg-slate-50 border ${errors.vehicleId ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {!formData.customerId
                        ? 'Select a customer first...'
                        : vehicles.length === 0
                          ? 'No vehicles found for this customer'
                          : 'Select a vehicle...'}
                    </option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber} — {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                )}
                <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              {errors.vehicleId && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.vehicleId}</p>
              )}
            </div>
          </div>

          {/* Selected Vehicle Preview Card */}
          {selectedVehicle && (
            <div className="mt-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plate</p>
                  <p className="text-sm font-bold text-slate-800">{selectedVehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</p>
                  <p className="text-sm font-bold text-slate-800">{selectedVehicle.brand}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</p>
                  <p className="text-sm font-bold text-slate-800">{selectedVehicle.model}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</p>
                  <p className="text-sm font-bold text-slate-800">{selectedVehicle.manufactureYear || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Appointment Details ────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Appointment Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date & Time */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="datetime-local"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  className={`w-full pl-12 pr-5 py-3.5 bg-slate-50 border ${errors.appointmentDate ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800`}
                />
              </div>
              {errors.appointmentDate && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.appointmentDate}</p>
              )}
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Service Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Wrench className="absolute left-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-6 py-3.5 bg-slate-50 border ${errors.serviceType ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer`}
                >
                  <option value="">Select service type...</option>
                  {SERVICE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              {errors.serviceType && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.serviceType}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Additional Notes
              <span className="ml-2 text-slate-300 font-medium normal-case tracking-normal">(Optional — max 500 chars)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                placeholder="e.g. Customer requests brake pads inspection, windshield wiper replacement..."
                className={`w-full pl-12 pr-5 py-3.5 bg-slate-50 border ${errors.notes ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 resize-none`}
              />
            </div>
            <div className="flex justify-between items-center">
              {errors.notes ? (
                <p className="text-red-600 text-xs font-medium">{errors.notes}</p>
              ) : <span />}
              <span className="text-xs text-slate-400 font-bold">
                {formData.notes.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* ─── Booking Summary Preview ────────────────────────────── */}
        {formData.customerId && formData.serviceType && formData.appointmentDate && (
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-black mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Booking Preview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Customer</p>
                <p className="font-bold text-sm">{selectedCustomer?.fullName || '—'}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Vehicle</p>
                <p className="font-bold text-sm">
                  {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Service</p>
                <p className="font-bold text-sm">{formData.serviceType}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Scheduled</p>
                <p className="font-bold text-sm">
                  {new Date(formData.appointmentDate).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Action Buttons ────────────────────────────────────── */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CalendarPlus className="w-5 h-5" />
            )}
            {loading ? 'Booking Appointment...' : 'Book Appointment'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
