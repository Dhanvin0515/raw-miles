export const metadata = {
  title: 'Terms & Conditions | Raw Miles',
}

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--cream)', color: 'var(--dark)', minHeight: '100vh', padding: '6rem 1.5rem 4rem' }}>
      <div className="container" style={{ maxWidth: 800, background: 'var(--white)', padding: '3rem', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid var(--gray-light)' }}>
        
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
          Terms & Conditions
        </h1>
        
        <div style={{ color: 'var(--dark)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          <p style={{ marginBottom: '2rem', color: 'var(--gray)' }}>By booking a trip with Raw Miles, participants confirm that they have read, understood, and agreed to these Terms & Conditions.</p>
          
          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>1. Booking & Confirmation</h2>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>A booking is confirmed only after the required payment is received.</li>
            <li>Seats are allotted on a first-come, first-served basis.</li>
            <li>Raw Miles reserves the right to accept or decline any booking.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>2. Payment Policy</h2>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>Full or partial payment must be made before the booking deadline.</li>
            <li>Prices are subject to change until the booking is confirmed.</li>
            <li>Any payment gateway or transaction charges shall be borne by the participant.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>3. Cancellation & Refund Policy</h2>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>15 days or more before departure: 90% refund.</li>
            <li>7–14 days before departure: 50% refund.</li>
            <li>Within 6 days of departure: No refund.</li>
            <li>No refunds for no-shows, late arrivals, or leaving the trip midway.</li>
            <li>Eligible refunds will be processed within 7–14 working days.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>4. Trip Cancellation</h2>
          <p style={{ marginBottom: '1.5rem' }}>Raw Miles may cancel or postpone a trip due to bad weather, natural calamities, government restrictions, insufficient participants, or other unforeseen circumstances. In such cases, participants will receive a full refund or the option to transfer to another trip.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>5. Itinerary Changes</h2>
          <p style={{ marginBottom: '1.5rem' }}>The itinerary may change due to weather, road conditions, permits, or safety reasons. The Trip Leader's decision will be final.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>6. Participant Responsibility</h2>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>Carry a valid Government ID.</li>
            <li>Arrive at the pickup point on time.</li>
            <li>Carry the required items mentioned in the itinerary.</li>
            <li>Follow the instructions of the Trip Leader.</li>
          </ul>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>7. Health & Fitness</h2>
          <p style={{ marginBottom: '1.5rem' }}>Participants must be physically fit for the trip and inform Raw Miles of any medical conditions in advance. Personal medications should be carried by the participant.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>8. Safety & Liability</h2>
          <p style={{ marginBottom: '1.5rem' }}>Adventure activities involve inherent risks. While Raw Miles takes reasonable safety measures, participants join at their own risk. Raw Miles is not liable for injuries, accidents, illness, loss, or damage arising from unforeseen circumstances.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>9. Women's Safety</h2>
          <p style={{ marginBottom: '1.5rem' }}>Women's safety is our top priority. Any form of harassment or inappropriate behaviour will result in immediate removal from the trip without any refund.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>10. Code of Conduct</h2>
          <p style={{ marginBottom: '1.5rem' }}>Participants must respect fellow travellers, locals, nature, and public property. Illegal drugs, weapons, violence, or any misconduct are strictly prohibited.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>11. Alcohol & Smoking</h2>
          <p style={{ marginBottom: '1.5rem' }}>Alcohol and smoking are prohibited during the trip unless specifically permitted by Raw Miles.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>12. Photography</h2>
          <p style={{ marginBottom: '1.5rem' }}>Photos and videos taken during the trip may be used for promotional purposes. Participants who do not wish to appear should inform the Trip Leader before the trip.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>13. Personal Belongings</h2>
          <p style={{ marginBottom: '1.5rem' }}>Participants are responsible for their own belongings. Raw Miles is not liable for any loss, theft, or damage.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>14. Transportation</h2>
          <p style={{ marginBottom: '1.5rem' }}>Participants must report to the pickup point at least 10 minutes before departure. The vehicle will wait for a maximum of 10 minutes. Late arrivals will be treated as no-shows.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>15. Meals & Accommodation</h2>
          <p style={{ marginBottom: '1.5rem' }}>Meals and accommodation will be provided only as mentioned in the itinerary. Accommodation may be on a sharing basis unless stated otherwise.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>16. Environmental Responsibility</h2>
          <p style={{ marginBottom: '1.5rem' }}>Participants are expected to keep the surroundings clean, avoid littering, and respect wildlife and local communities.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>17. Emergency Contact</h2>
          <p style={{ marginBottom: '1.5rem' }}>Every participant must provide a valid emergency contact number before the trip.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>18. Minimum Group Size</h2>
          <p style={{ marginBottom: '1.5rem' }}>Trips may be cancelled or rescheduled if the minimum number of participants is not met. Participants will receive a full refund or the option to join another trip.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>19. Travel Insurance</h2>
          <p style={{ marginBottom: '1.5rem' }}>Participants are encouraged to arrange their own travel and medical insurance. Raw Miles is not responsible for insurance-related claims.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>20. Force Majeure</h2>
          <p style={{ marginBottom: '1.5rem' }}>Raw Miles is not responsible for delays, cancellations, or itinerary changes caused by weather, natural disasters, road closures, government restrictions, strikes, or other events beyond our control.</p>

          <h2 style={{ fontSize: '1.25rem', color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>21. Acceptance of Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>By booking a trip with Raw Miles, participants confirm that they have read, understood, and agreed to these Terms & Conditions and will follow the instructions of the Trip Leader throughout the trip.</p>

        </div>
      </div>
    </div>
  )
}
