import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Send, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function RequestForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [neededByDate, setNeededByDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    {
      id: Date.now(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxPercent: 0,
    },
  ]);

  useEffect(() => {
    async function fetchRequest() {
      if (!id || !profile) return;
      try {
        setLoading(true);
        const { data: reqData, error: reqErr } = await supabase
          .from('purchase_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (reqErr) throw reqErr;

        // Exact behavior: if not Draft, stay on page but show read-only block
        if (reqData.status !== 'Draft') {
          setIsReadOnly(true);
          return;
        }

        setNeededByDate(reqData.needed_by_date || '');
        setSupplierName(reqData.supplier_name || '');
        setCurrencyCode(reqData.currency_code || 'USD');
        setNotes(reqData.notes || '');

        const { data: itemsData, error: itemsErr } = await supabase
          .from('purchase_request_items')
          .select('*')
          .eq('purchase_request_id', id)
          .order('line_no');

        if (itemsErr) throw itemsErr;

        if (itemsData && itemsData.length > 0) {
          setItems(itemsData.map((item: any) => ({
            id: item.id || Date.now() + Math.random(),
            name: item.item_name,
            description: item.description || '',
            quantity: item.quantity,
            unitPrice: item.unit_price,
            taxPercent: item.tax_percent
          })));
        }
      } catch (err: any) {
        console.error('Error loading request', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequest();
  }, [id, profile]);

  const generateRequestNo = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    // Crypto safe generation
    const array = new Uint8Array(3);
    window.crypto.getRandomValues(array);
    const randomHex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    return `PR-${yyyy}${mm}${dd}-${randomHex}`;
  };

  const handleSave = async (isSubmit: boolean) => {
    if (!profile || isReadOnly) return;

    if (!neededByDate || !supplierName || items.length === 0) {
      alert('Please fill out all required fields');
      return;
    }

    for (const item of items) {
      if (!item.name || item.quantity < 1 || item.unitPrice < 0) {
        alert('Please review item details. Name is required, quantity >= 1, price >= 0.');
        return;
      }
    }

    try {
      setSaving(true);
      const headerStatus = 'Draft';

      let prId = id;

      if (!prId) {
        const requestNo = generateRequestNo();

        const { data: newPr, error: insertError } = await supabase
          .from('purchase_requests')
          .insert({
            request_no: requestNo,
            requester_id: profile.id,
            department_id: profile.department_id,
            request_date: new Date().toISOString().split('T')[0],
            needed_by_date: neededByDate,
            supplier_name: supplierName,
            currency_code: currencyCode,
            notes: notes,
            status: headerStatus,
            total_before_tax: subtotal,
            total_tax: taxTotal,
            grand_total: grandTotal
          })
          .select()
          .single();

        if (insertError) throw insertError;
        prId = newPr.id;
      } else {
        const { error: updateError } = await supabase
          .from('purchase_requests')
          .update({
            needed_by_date: neededByDate,
            supplier_name: supplierName,
            currency_code: currencyCode,
            notes: notes,
            status: headerStatus,
            total_before_tax: subtotal,
            total_tax: taxTotal,
            grand_total: grandTotal
          })
          .eq('id', prId)
          .eq('status', 'Draft');

        if (updateError) throw updateError;

        console.log('ITEMS_TO_DELETE_RUNTIME', prId);
        const { error: delError } = await supabase
          .from('purchase_request_items')
          .delete()
          .eq('purchase_request_id', prId);

        if (delError) throw delError;
      }

      const itemsToInsert = items.map((item, idx) => ({
        purchase_request_id: prId,
        line_no: idx + 1,
        item_name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_percent: item.taxPercent
      }));

      console.log('ITEMS_TO_INSERT_RUNTIME', itemsToInsert);
      const { error: itemsError } = await supabase
        .from('purchase_request_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      if (isSubmit) {
        const { error: submitError } = await supabase
          .from('purchase_requests')
          .update({ status: 'Submitted' })
          .eq('id', prId)
          .eq('status', 'Draft');

        if (submitError) throw submitError;
      }

      navigate(`/requests/${prId}`);
    } catch (err: any) {
      console.error(err);
      alert('Error saving PR: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxPercent: 0,
      },
    ]);
  };

  const updateItem = (itemId: number, field: string, value: any) => {
    setItems(items.map(item => item.id === itemId ? { ...item, [field]: value } : item));
  };

  const removeItem = (itemId: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxPercent / 100)), 0);
  const grandTotal = subtotal + taxTotal;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(val);
  };

  if (loading) {
    return <div className="page-container" style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (isReadOnly) {
    return (
      <div className="page-container" style={{ paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>
            Read-Only Request
          </h1>
        </div>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#991b1b'
        }}>
          <AlertTriangle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Editing Blocked</h2>
          <p style={{ margin: 0, fontSize: '1.125rem' }}>
            This request is no longer in Draft status and cannot be edited.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="page-container"
      data-testid="pr-form-page"
      style={{ paddingBottom: '4rem' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>
          {id ? 'Edit Draft Request' : 'Create Purchase Request'}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
        {/* Header Section */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              marginTop: 0,
              marginBottom: '1.5rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.75rem',
            }}
          >
            General Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                }}
              >
                Needed By Date *
              </label>
              <input
                type="date"
                value={neededByDate}
                onChange={(e) => setNeededByDate(e.target.value)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
                data-testid="pr-form-needed-by-date-input"
                disabled={saving}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                }}
              >
                Supplier Name *
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Dell, AWS"
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
                data-testid="pr-form-supplier-name-input"
                disabled={saving}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                }}
              >
                Currency *
              </label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  backgroundColor: 'white',
                }}
                data-testid="pr-form-currency-code-input"
                disabled={saving}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="SAR">SAR - Saudi Riyal</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginTop: '1.5rem',
            }}
          >
            <label
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
              }}
            >
              Notes / Justification
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide a reason for this purchase request..."
              style={{
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border)',
                outline: 'none',
                resize: 'vertical',
              }}
              data-testid="pr-form-notes-textarea"
              disabled={saving}
            />
          </div>
        </div>

        {/* Line Items Section */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.75rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Line Items</h2>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                opacity: saving ? 0.7 : 1,
              }}
              onClick={addItem}
              data-testid="pr-form-add-item-btn"
              disabled={saving}
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr auto',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Laptop"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-name-input`}
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Specs..."
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-description-input`}
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="1"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-quantity-input`}
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Unit Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-unit-price-input`}
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Tax %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.taxPercent}
                    onChange={(e) => updateItem(item.id, 'taxPercent', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-tax-percent-input`}
                    disabled={saving}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    alignSelf: 'center',
                    marginTop: '1.25rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: (items.length > 1 && !saving) ? 'pointer' : 'not-allowed',
                      opacity: (items.length > 1 && !saving) ? 1 : 0.5,
                      padding: '0.5rem',
                    }}
                    disabled={items.length <= 1 || saving}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <div
              style={{
                width: '300px',
                backgroundColor: 'var(--bg-main)',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Tax Total</span>
                <span>{formatCurrency(taxTotal)}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid #d1d5db',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                }}
              >
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => handleSave(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              border: '1px solid var(--border)',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              opacity: saving ? 0.7 : 1,
            }}
            data-testid="pr-form-save-draft-btn"
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
            data-testid="pr-form-submit-btn"
            disabled={saving}
          >
            <Send size={18} />
            {saving ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}