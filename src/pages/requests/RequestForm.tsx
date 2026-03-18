import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';

export default function RequestForm() {
  const navigate = useNavigate();
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

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

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
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>
          Create Purchase Request
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
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
                data-testid="pr-form-needed-by-date-input"
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
                placeholder="e.g. Dell, AWS"
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
                data-testid="pr-form-supplier-name-input"
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
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  backgroundColor: 'white',
                }}
                data-testid="pr-form-currency-code-input"
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
              placeholder="Provide a reason for this purchase request..."
              style={{
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border)',
                outline: 'none',
                resize: 'vertical',
              }}
              data-testid="pr-form-notes-textarea"
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
                cursor: 'pointer',
                fontWeight: 500,
              }}
              onClick={addItem}
              data-testid="pr-form-add-item-btn"
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
                    placeholder="Laptop"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-name-input`}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Specs..."
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-description-input`}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-quantity-input`}
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
                    placeholder="0.00"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-unit-price-input`}
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
                    placeholder="0"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border)',
                      width: '100%',
                    }}
                    data-testid={`pr-item-${index}-tax-percent-input`}
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
                      cursor: items.length > 1 ? 'pointer' : 'not-allowed',
                      opacity: items.length > 1 ? 1 : 0.5,
                      padding: '0.5rem',
                    }}
                    disabled={items.length <= 1}
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
                <span>$0.00</span>
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
                <span>$0.00</span>
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
                <span>$0.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              border: '1px solid var(--border)',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            data-testid="pr-form-save-draft-btn"
          >
            <Save size={18} />
            Save as Draft
          </button>

          <button
            type="button"
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
            }}
            data-testid="pr-form-submit-btn"
          >
            <Send size={18} />
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}