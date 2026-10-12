import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaBed,
  FaChartLine,
  FaUserClock,
  FaArrowRight
} from 'react-icons/fa';

function BusinessQuestions() {
  const [expandedId, setExpandedId] = useState(null);

  const questions = [
    {
      id: 1,
      Icon: FaBed,
      question: 'Which rooms are available for check-in?',
      answer:
        'View the Room Management Board for real-time room status (Available, Occupied, Cleaning, Maintenance). Filter by floor or status to find available rooms quickly.',
      link: '/',
      linkLabel: 'Go to Dashboard',
    },
    {
      id: 2,
      Icon: FaChartLine,
      question: 'What is our total revenue and occupancy this month?',
      answer:
        'The Revenue & Occupancy report shows monthly income, current occupancy rate, total bookings, and a daily revenue chart.',
      link: '/reports',
      linkLabel: 'View Revenue Report',
    },
    {
      id: 3,
      Icon: FaUserClock,
      question: 'What is the stay and payment history for a guest?',
      answer:
        'The Guest History report lets you search by name or phone number and see every booking, room, payment, and status.',
      link: '/reports',
      linkLabel: 'View Guest History',
    },
  ];

  return (
    <div style={panelStyle}>
      <h3 style={panelTitle}>
        <FaQuestionCircle size={12} style={{ marginRight: '6px' }} />
        BUSINESS QUESTIONS
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {questions.map((q) => {
          const Icon = q.Icon;
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              style={{
                background: '#f8f4ea',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #f0eadd',
              }}
            >
              {/* Question row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  color: '#1e3a2f',
                  fontWeight: 600,
                }}
              >
                <Icon size={14} color="#b85c38" />
                <span style={{ flex: 1 }}>{q.question}</span>
                {isExpanded ? (
                  <FaChevronUp size={10} color="#8b5a3c" />
                ) : (
                  <FaChevronDown size={10} color="#8b5a3c" />
                )}
              </div>

              {/* Answer */}
              {isExpanded && (
                <div
                  style={{
                    padding: '0 12px 12px 12px',
                    fontSize: '11px',
                    color: '#4a4a4a',
                    lineHeight: '1.5',
                    borderTop: '1px solid #e5d9c0',
                    paddingTop: '10px',
                  }}
                >
                  <p style={{ margin: '0 0 8px 0' }}>{q.answer}</p>
                  <Link
                    to={q.link}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: '#b85c38',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {q.linkLabel} <FaArrowRight size={9} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const panelStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  marginBottom: '16px',
};

const panelTitle = {
  fontSize: '11px',
  letterSpacing: '1.5px',
  color: '#666',
  margin: '0 0 12px 0',
  display: 'flex',
  alignItems: 'center',
};

export default BusinessQuestions;