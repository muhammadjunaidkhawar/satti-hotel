import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  useReservationsQuery,
  useAddReservationMutation,
  useUpdateReservationMutation,
} from '../api/reservation.api';
import { useTablesQuery } from '../api/table.api';
import Modal from '../components/common/Modal';

export default function Reservation() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm();

  const watchedFloor = watch('floor', 1);

  // Fetch tables
  const { data: tablesData, isLoading: tablesLoading } = useTablesQuery();
  const allTables = tablesData?.result || [];

  // Filter tables by floor
  const tablesByFloor = useMemo(() => {
    const grouped = {};
    allTables.forEach((table) => {
      if (!grouped[table.floor]) {
        grouped[table.floor] = [];
      }
      grouped[table.floor].push(table);
    });
    // Sort by table number
    Object.keys(grouped).forEach((floor) => {
      grouped[floor].sort((a, b) => a.number - b.number);
    });
    return grouped;
  }, [allTables]);

  // Get tables for selected floor
  const floorTables = tablesByFloor[selectedFloor] || [];

  // Fetch reservations for selected date
  const { data: reservationsData, isLoading: reservationsLoading } = useReservationsQuery(
    { date: selectedDate },
    { enabled: !!selectedDate }
  );
  const reservations = reservationsData?.result || [];

  // Filter reservations by floor
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const table = typeof reservation.table === 'object' ? reservation.table : allTables.find((t) => t._id === reservation.table);
      return table && table.floor === selectedFloor;
    });
  }, [reservations, selectedFloor, allTables]);

  const addReservationMutation = useAddReservationMutation({
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const updateReservationMutation = useUpdateReservationMutation({
    onSuccess: () => {
      handleCloseModal();
      setShowDetails(false);
      setSelectedReservation(null);
    },
  });

  // Time slots
  const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  // Find reservation for a table and time
  const findReservationForCell = (tableId, time) => {
    return filteredReservations.find((r) => {
      const reservationTable = typeof r.table === 'object' ? r.table._id : r.table;
      return reservationTable === tableId && r.time === time;
    });
  };

  // Handle add new reservation
  const handleAddNew = () => {
    setEditingReservation(null);
    reset({
      floor: selectedFloor,
      table: floorTables[0]?._id || '',
      max_persons: 1,
      date: selectedDate,
      time: '13:00',
      advance_fee: 0,
      status: 'confirmed',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      payment_method: 'cash on delivery',
      payment_status: 'pending',
      payment_amount: 0,
    });
    setIsModalOpen(true);
  };

  // Handle edit reservation
  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    const table = typeof reservation.table === 'object' ? reservation.table : allTables.find((t) => t._id === reservation.table);
    setValue('floor', table?.floor || selectedFloor);
    setValue('table', reservation.table?._id || reservation.table);
    setValue('max_persons', reservation.max_persons);
    setValue('date', new Date(reservation.date).toISOString().slice(0, 10));
    setValue('time', reservation.time);
    setValue('advance_fee', reservation.advance_fee || 0);
    setValue('status', reservation.status);
    setValue('customer_name', reservation.customer?.name || '');
    setValue('customer_phone', reservation.customer?.phone || '');
    setValue('customer_email', reservation.customer?.email || '');
    setValue('payment_method', reservation.payment?.payment_method || 'cash on delivery');
    setValue('payment_status', reservation.payment?.payment_status || 'pending');
    setValue('payment_amount', reservation.payment?.payment_amount || 0);
    setIsModalOpen(true);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const payload = {
        table: data.table,
        max_persons: parseInt(data.max_persons),
        date: new Date(data.date),
        time: data.time,
        advance_fee: parseFloat(data.advance_fee) || 0,
        status: data.status,
        customer: {
          name: data.customer_name,
          phone: data.customer_phone,
          email: data.customer_email || '',
        },
        payment: {
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          payment_amount: parseFloat(data.payment_amount) || 0,
        },
      };

      if (editingReservation) {
        await updateReservationMutation.mutateAsync({
          id: editingReservation._id,
          payload,
        });
      } else {
        await addReservationMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReservation(null);
    reset();
  };

  // Handle reservation click
  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetails(true);
  };

  // Update floor when form floor changes
  useEffect(() => {
    if (watchedFloor && watchedFloor !== selectedFloor) {
      setSelectedFloor(watchedFloor);
      const floorTables = tablesByFloor[watchedFloor] || [];
      if (floorTables.length > 0) {
        setValue('table', floorTables[0]._id);
      }
    }
  }, [watchedFloor, selectedFloor, tablesByFloor, setValue]);

  // Render reservation block
  const renderReservationBlock = (reservation) => {
    const isConfirmed = reservation.status === 'confirmed';
    const color = isConfirmed ? '#FF9500' : '#6b7280';

    return (
      <div
        key={reservation._id}
        onClick={() => handleReservationClick(reservation)}
        className="relative text-white rounded-md p-2 border border-gray-600 hover:shadow-lg cursor-pointer"
        style={{
          backgroundColor: color,
          gridColumn: 'span 1',
        }}
        title={`${reservation.customer?.name || 'Guest'} • ${reservation.max_persons} pax • ${reservation.time}`}
      >
        <p className="text-xs font-medium truncate">{reservation.customer?.name || 'Guest'}</p>
        <div className="flex items-center gap-1 text-xs mt-1">
          <span>👥</span>
          <span>{reservation.max_persons}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 pt-4 pb-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          {[1, 2, 3].map((floor) => (
            <button
              key={floor}
              onClick={() => {
                setSelectedFloor(floor);
                setValue('floor', floor);
                const floorTables = tablesByFloor[floor] || [];
                if (floorTables.length > 0) {
                  setValue('table', floorTables[0]._id);
                }
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFloor === floor
                  ? 'bg-[#FF9500] text-black'
                  : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
              }`}
            >
              {floor === 1 ? '1st Floor' : floor === 2 ? '2nd Floor' : '3rd Floor'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#2a2a2a] text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
          />
          <button
            onClick={handleAddNew}
            className="bg-[#FF9500] hover:bg-[#e68806] text-black px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            Add Reservation
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        {reservationsLoading || tablesLoading ? (
          <div className="p-6 text-center text-gray-400">Loading reservations...</div>
        ) : floorTables.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No tables available for this floor</div>
        ) : (
          <div className="grid grid-cols-[120px_repeat(11,1fr)] text-sm border border-gray-700 rounded-lg overflow-hidden">
            {/* Time Header */}
            <div className="bg-[#1a1a1a] p-3 border-r border-gray-700 font-semibold" />
            {times.map((time) => (
              <div key={time} className="bg-[#1a1a1a] text-center py-3 border-r border-gray-700 font-semibold text-white">
                {time}
              </div>
            ))}

            {/* Table Rows */}
            {floorTables.map((table) => (
              <React.Fragment key={table._id}>
                <div className="bg-[#1a1a1a] text-center py-3 border-r border-b border-gray-700 font-medium text-white">
                  Table {table.number}
                </div>
                {times.map((time) => {
                  const reservation = findReservationForCell(table._id, time);
                  if (reservation) {
                    return (
                      <div key={`${reservation._id}_${time}`} className="border-r border-b border-gray-700 min-h-[60px] p-1">
                        {renderReservationBlock(reservation)}
                      </div>
                    );
                  }
                  return (
                    <div key={`${table._id}_${time}`} className="border-r border-b border-gray-700 min-h-[60px] bg-[#1f1f1f]" />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Reservation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingReservation ? 'Edit Reservation' : 'Add Reservation'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Floor *</label>
              <select
                {...register('floor', { required: 'Floor is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              >
                <option value={1}>1st Floor</option>
                <option value={2}>2nd Floor</option>
                <option value={3}>3rd Floor</option>
              </select>
              {errors.floor && <p className="text-red-400 text-xs mt-1">{errors.floor.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Table *</label>
              <select
                {...register('table', { required: 'Table is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              >
                {tablesByFloor[watchedFloor || selectedFloor]?.map((table) => (
                  <option key={table._id} value={table._id}>
                    Table {table.number} (Capacity: {table.capacity})
                  </option>
                ))}
              </select>
              {errors.table && <p className="text-red-400 text-xs mt-1">{errors.table.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
              <select
                {...register('time', { required: 'Time is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              >
                {times.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Persons *</label>
              <input
                type="number"
                min="1"
                {...register('max_persons', {
                  required: 'Max persons is required',
                  min: { value: 1, message: 'Must be at least 1' },
                })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
              {errors.max_persons && <p className="text-red-400 text-xs mt-1">{errors.max_persons.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Advance Fee</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('advance_fee', { min: { value: 0, message: 'Must be 0 or greater' } })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
              {errors.advance_fee && <p className="text-red-400 text-xs mt-1">{errors.advance_fee.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              >
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  {...register('customer_name', { required: 'Customer name is required' })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                  placeholder="John Doe"
                />
                {errors.customer_name && <p className="text-red-400 text-xs mt-1">{errors.customer_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                <input
                  type="text"
                  {...register('customer_phone', { required: 'Phone is required' })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                  placeholder="+1 (123) 456-7890"
                />
                {errors.customer_phone && <p className="text-red-400 text-xs mt-1">{errors.customer_phone.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  {...register('customer_email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                  placeholder="john.doe@example.com"
                />
                {errors.customer_email && <p className="text-red-400 text-xs mt-1">{errors.customer_email.message}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method *</label>
                <select
                  {...register('payment_method', { required: 'Payment method is required' })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                >
                  <option value="cash on delivery">Cash on Delivery</option>
                  <option value="online transfer">Online Transfer</option>
                  <option value="card">Card</option>
                  <option value="no advance payment">No Advance Payment</option>
                </select>
                {errors.payment_method && <p className="text-red-400 text-xs mt-1">{errors.payment_method.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Status *</label>
                <input
                  type="text"
                  {...register('payment_status', { required: 'Payment status is required' })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                  placeholder="pending"
                />
                {errors.payment_status && <p className="text-red-400 text-xs mt-1">{errors.payment_status.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('payment_amount', {
                    required: 'Payment amount is required',
                    min: { value: 0, message: 'Must be 0 or greater' },
                  })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                />
                {errors.payment_amount && <p className="text-red-400 text-xs mt-1">{errors.payment_amount.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || addReservationMutation.isPending || updateReservationMutation.isPending}
              className="flex-1 px-4 py-2 bg-[#FF9500] hover:bg-[#e68806] text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || addReservationMutation.isPending || updateReservationMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  {editingReservation ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                editingReservation ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reservation Details Panel */}
      {showDetails && selectedReservation && (
        <div className="fixed top-0 right-0 w-[540px] h-full bg-[#0e0e0e]/95 backdrop-blur-xl text-white shadow-[0_0_20px_rgba(255,149,0,0.15)] z-50 overflow-y-auto rounded-l-[2rem] border-l border-[#2a2a2a]">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#FF9500] tracking-wide">Reservation Details</h2>
                <div className="text-xs text-gray-400 mt-1">Detailed view of selected reservation</div>
              </div>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedReservation(null);
                }}
                className="text-gray-400 hover:text-[#FF9500] text-2xl transition-all"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#2a2a2a] shadow-inner bg-[#141414]">
              <div className="h-36 bg-gradient-to-br from-[#FF9500] to-[#ff6600] relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e]/70 via-transparent to-transparent"></div>
              </div>

              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400">Table</div>
                    <div className="text-lg font-semibold text-white">
                      {typeof selectedReservation.table === 'object'
                        ? `Table ${selectedReservation.table.number}`
                        : '--'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Status</div>
                    <div
                      className={`text-lg font-semibold ${
                        selectedReservation.status === 'confirmed' ? 'text-[#FF9500]' : 'text-gray-400'
                      }`}
                    >
                      {selectedReservation.status || '--'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-400">Date</div>
                    <div>{new Date(selectedReservation.date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Time</div>
                    <div>{selectedReservation.time || '--'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Guests</div>
                    <div>{selectedReservation.max_persons || '--'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Advance Fee</div>
                    <div>${(selectedReservation.advance_fee || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Payment Method</div>
                    <div>{selectedReservation.payment?.payment_method || '--'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Payment Amount</div>
                    <div>${(selectedReservation.payment?.payment_amount || 0).toFixed(2)}</div>
                  </div>
                </div>

                <div className="border-t border-[#2a2a2a] my-4" />

                <div>
                  <div className="text-xs text-gray-400 mb-2">Customer</div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9500] to-[#ff6600] flex items-center justify-center text-black font-extrabold text-lg shadow-[0_0_10px_rgba(255,149,0,0.4)]">
                      {(selectedReservation.customer?.name || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{selectedReservation.customer?.name || '--'}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {selectedReservation.customer?.phone || '--'} • {selectedReservation.customer?.email || '--'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#2a2a2a] my-4" />

                <div className="flex justify-between items-center gap-3">
                  <button
                    onClick={() => {
                      handleEdit(selectedReservation);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] hover:from-[#FF9500]/20 hover:to-[#2a2a2a] border border-[#333] transition-all font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
