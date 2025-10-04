import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, Lock, LogOut, Home } from 'lucide-react';

// Constants
const BUSINESS_HOURS = {
  start: 8,
  end: 16,
  workDays: [0, 1, 2, 3, 4] // Sunday to Thursday
};

const TREATMENT_TYPES = [
  { id: 'manicure', name: 'מניקור', duration: 60 },
  { id: 'pedicure', name: 'פדיקור', duration: 60 },
  { id: 'gel', name: 'ג\'ל', duration: 60 }
];

const ADMIN_PASSWORD = 'admin123';

export default function NailSalonApp() {
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    treatment: '',
    date: '',
    time: ''
  });

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const mockAppointments = [
      {
        id: '1',
        name: 'שרה כהן',
        phone: '050-1234567',
        treatment: 'מניקור',
        date: '2025-10-06',
        time: '09:00',
        status: 'pending'
      },
      {
        id: '2',
        name: 'רחל לוי',
        phone: '052-9876543',
        treatment: 'פדיקור',
        date: '2025-10-06',
        time: '11:00',
        status: 'approved'
      }
    ];
    setAppointments(mockAppointments);

    const mockBlocked = [
      { date: '2025-10-07', time: '14:00' },
      { date: '2025-10-08', time: 'all-day' }
    ];
    setBlockedSlots(mockBlocked);
  }, []);

  const generateTimeSlots = (selectedDate) => {
    const slots = [];
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();

    if (!BUSINESS_HOURS.workDays.includes(dayOfWeek)) {
      return [];
    }

    const isDayBlocked = blockedSlots.some(
      slot => slot.date === selectedDate && slot.time === 'all-day'
    );
    if (isDayBlocked) return [];

    for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      
      const isBlocked = blockedSlots.some(
        slot => slot.date === selectedDate && slot.time === timeStr
      );
      
      const isBooked = appointments.some(
        apt => apt.date === selectedDate && apt.time === timeStr && apt.status === 'approved'
      );

      if (!isBlocked && !isBooked) {
        slots.push(timeStr);
      }
    }

    return slots;
  };

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setView('admin');
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('סיסמה שגויה');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setView('home');
  };

  const handleClientSubmit = () => {
    if (!clientForm.name || !clientForm.phone || !clientForm.treatment || !clientForm.date || !clientForm.time) {
      alert('נא למלא את כל השדות');
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),
      ...clientForm,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setAppointments([...appointments, newAppointment]);
    
    setClientForm({
      name: '',
      phone: '',
      treatment: '',
      date: '',
      time: ''
    });

    alert('התור נשלח לאישור! בעלת העסק תאשר בקרוב.');
    setView('home');
  };

  const approveAppointment = (id) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'approved' } : apt
    ));
  };

  const rejectAppointment = (id) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  const getNextDays = (count = 14) => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay();
      if (BUSINESS_HOURS.workDays.includes(dayOfWeek)) {
        days.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('he-IL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })
        });
      }
    }
    
    return days;
  };

  // HOME VIEW
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">סלון ציפורניים</h1>
            <p className="text-gray-600">מערכת תורים מקוונת</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setView('client')}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-3 shadow-lg"
            >
              <User size={24} />
              <span className="text-lg">קביעת תור</span>
            </button>

            <button
              onClick={() => setView('adminLogin')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-3 shadow-lg"
            >
              <Lock size={24} />
              <span className="text-lg">כניסת בעלת עסק</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN LOGIN VIEW
  if (view === 'adminLogin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <button
            onClick={() => setView('home')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <Home size={20} />
            <span>חזרה</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">כניסת בעלת עסק</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="הזיני סיסמה"
              />
            </div>

            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {loginError}
              </div>
            )}

            <button
              onClick={handleAdminLogin}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200"
            >
              התחברות
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CLIENT BOOKING VIEW
  if (view === 'client') {
    const availableDays = getNextDays();
    const availableSlots = clientForm.date ? generateTimeSlots(clientForm.date) : [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <button
              onClick={() => setView('home')}
              className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <Home size={20} />
              <span>חזרה</span>
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">קביעת תור</h2>
              <p className="text-gray-600">מלאי את הפרטים ובחרי מועד מתאים</p>
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                  <User size={18} />
                  שם מלא
                </label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                  placeholder="לדוגמה: שרה כהן"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                  <Phone size={18} />
                  טלפון
                </label>
                <input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                  placeholder="050-1234567"
                />
              </div>

              {/* Treatment Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">סוג טיפול</label>
                <div className="grid grid-cols-3 gap-3">
                  {TREATMENT_TYPES.map(treatment => (
                    <button
                      key={treatment.id}
                      type="button"
                      onClick={() => setClientForm({...clientForm, treatment: treatment.name})}
                      className={`py-3 px-4 rounded-xl font-medium transition duration-200 ${
                        clientForm.treatment === treatment.name
                          ? 'bg-pink-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {treatment.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                  <Calendar size={18} />
                  תאריך
                </label>
                <select
                  value={clientForm.date}
                  onChange={(e) => setClientForm({...clientForm, date: e.target.value, time: ''})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                >
                  <option value="">בחרי תאריך</option>
                  {availableDays.map(day => (
                    <option key={day.date} value={day.date}>
                      {day.display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              {clientForm.date && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Clock size={18} />
                    שעה
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setClientForm({...clientForm, time: slot})}
                          className={`py-3 px-4 rounded-xl font-medium transition duration-200 ${
                            clientForm.time === slot
                              ? 'bg-pink-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl">
                      אין שעות פנויות בתאריך זה
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleClientSubmit}
                disabled={!clientForm.name || !clientForm.phone || !clientForm.treatment || !clientForm.date || !clientForm.time}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-lg"
              >
                שליחת בקשה לתור
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN VIEW
  if (view === 'admin' && isAdmin) {
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
    const approvedAppointments = appointments.filter(apt => apt.status === 'approved');

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">ניהול תורים</h2>
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition duration-200"
              >
                <LogOut size={18} />
                התנתקות
              </button>
            </div>

            {/* Pending Appointments */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={24} className="text-orange-500" />
                תורים ממתינים לאישור ({pendingAppointments.length})
              </h3>
              
              {pendingAppointments.length === 0 ? (
                <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-600">
                  אין תורים ממתינים
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAppointments.map(apt => (
                    <div key={apt.id} className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-800">{apt.name}</div>
                        <div className="text-gray-600 flex items-center gap-4 mt-1 flex-wrap">
                          <span>📱 {apt.phone}</span>
                          <span>💅 {apt.treatment}</span>
                        </div>
                        <div className="text-gray-700 font-medium mt-2">
                          📅 {new Date(apt.date).toLocaleDateString('he-IL')} | ⏰ {apt.time}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveAppointment(apt.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition duration-200"
                        >
                          <CheckCircle size={18} />
                          אישור
                        </button>
                        <button
                          onClick={() => rejectAppointment(apt.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition duration-200"
                        >
                          <XCircle size={18} />
                          דחייה
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Appointments */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle size={24} className="text-green-500" />
                תורים מאושרים ({approvedAppointments.length})
              </h3>
              
              {approvedAppointments.length === 0 ? (
                <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-600">
                  אין תורים מאושרים
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedAppointments.map(apt => (
                    <div key={apt.id} className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="font-bold text-lg text-gray-800">{apt.name}</div>
                      <div className="text-gray-600 flex items-center gap-4 mt-1 flex-wrap">
                        <span>📱 {apt.phone}</span>
                        <span>💅 {apt.treatment}</span>
                      </div>
                      <div className="text-gray-700 font-medium mt-2">
                        📅 {new Date(apt.date).toLocaleDateString('he-IL')} | ⏰ {apt.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
