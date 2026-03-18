import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, CheckCircle } from 'lucide-react';

export default function ApprovalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showRejectModal, setShowRejectModal] = useState(false);

  const mockStatus = 'Submitted';
  const isPending = mockStatus === 'Submitted';

  return (
    <div
      className="page-container"
      data-testid="approval-detail-page"
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
          Review Request: {id ?? 'PR-0002'}
        </h1>

        <span
          data-testid="approval-detail-status-badge"
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 500,
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            marginLeft: 'auto',
          }}
        >
          {mockStatus}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header Summary */}
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
              margin: 0,
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            Request Summary
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  margin: '0 0 0.25rem 0',
                }}
              >
                Requester
              </p>
              <p style={{ fontWeight: 500, margin: 0 }}>Alice IT Req (IT)</p>
            </div>

            <div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  margin: '0 0 0.25rem 0',
                }}
              >
                Request Date
              </p>
              <p style={{ fontWeight: 500, margin: 0 }}>2026-03-12</p>
            </div>

            <div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  margin: '0 0 0.25rem 0',
                }}
              >
                Needed By
              </p>
              <p style={{ fontWeight: 500, margin: 0 }}>2026-03-30</p>
            </div>

            <div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  margin: '0 0 0.25rem 0',
                }}
              >
                Supplier
              </p>
              <p style={{ fontWeight: 500, margin: 0 }}>AWS</p>
            </div>

            <div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  margin: '0 0 0.25rem 0',
                }}
              >
                Currency
              </p>
              <p style={{ fontWeight: 500, margin: 0 }}>USD</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                margin: '0 0 0.25rem 0',
              }}
            >
              Notes / Justification
            </p>
            <p
              style={{
                margin: 0,
                backgroundColor: 'var(--bg-main)',
                padding: '1rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border)',
                minHeight: '3rem',
              }}
            >
              Monthly compute resources needed for the new analytics project
              environment.
            </p>
          </div>
        </div>

        {/* Line Items */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Line Items</h2>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-main)' }}>
              <tr>
                <th
                  style={{
                    padding: '0.75rem 2rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  Item Name
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  Unit Price
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  Tax %
                </th>
                <th
                  style={{
                    padding: '0.75rem 2rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  Line Total
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
                  AWS EC2 Instances
                </td>
                <td
                  style={{
                    padding: '1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  t3.large spot instances
                </td>
                <td
                  style={{
                    padding: '1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  4
                </td>
                <td
                  style={{
                    padding: '1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  $100.00
                </td>
                <td
                  style={{
                    padding: '1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  0%
                </td>
                <td
                  style={{
                    padding: '1rem 2rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                    fontWeight: 500,
                  }}
                >
                  $400.00
                </td>
              </tr>

              <tr>
                <td style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
                  AWS S3 Storage
                </td>
                <td
                  style={{
                    padding: '1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Standard tier block storage
                </td>
                <td
                  style={{
                    padding: '1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  1
                </td>
                <td
                  style={{
                    padding: '1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  $100.00
                </td>
                <td
                  style={{
                    padding: '1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                  }}
                >
                  0%
                </td>
                <td
                  style={{
                    padding: '1rem 2rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'right',
                    fontWeight: 500,
                  }}
                >
                  $100.00
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.5rem 2rem' }}>
            <div style={{ width: '300px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Subtotal</span>
                <span>$500.00</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Total Tax</span>
                <span>$0.00</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                }}
              >
                <span>Grand Total</span>
                <span>$500.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
              onClick={() => setShowRejectModal(true)}
              data-testid="approval-detail-reject-btn"
            >
              <X size={18} />
              Reject
            </button>

            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
              data-testid="approval-detail-approve-btn"
            >
              <Check size={18} />
              Approve
            </button>
          </div>
        )}

        {/* Approval History */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
          }}
          data-testid="approval-detail-approval-history"
        >
          <h3
            style={{
              fontSize: '1rem',
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle size={18} color="var(--text-muted)" />
            Approval History
          </h3>

          <div
            style={{
              backgroundColor: 'var(--bg-main)',
              padding: '1rem',
              borderRadius: '0.375rem',
              border: '1px dashed var(--border)',
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontSize: '0.875rem',
            }}
          >
            No approval actions recorded yet.
          </div>
        </div>
      </div>

      {/* Reject Modal Placeholder */}
      {showRejectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '2rem',
              borderRadius: '0.5rem',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Reject Request</h3>

            <p
              style={{
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              Please provide a reason for rejecting this purchase request.
            </p>

            <textarea
              rows={4}
              placeholder="Rejection reason (required)..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border)',
                outline: 'none',
                marginBottom: '1.5rem',
                resize: 'vertical',
              }}
              data-testid="approval-detail-reject-reason-input"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }}
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }}
                data-testid="approval-detail-reject-confirm-btn"
                onClick={() => setShowRejectModal(false)}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}