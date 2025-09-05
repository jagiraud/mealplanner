function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c' }}>
            🍽️ Meal Planner
          </h1>
        </div>
      </header>
      
      <main>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ padding: '24px 0' }}>
            <div style={{ 
              border: '4px dashed #e2e8f0', 
              borderRadius: '8px', 
              height: '384px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                  Welcome to Meal Planner!
                </h2>
                <p style={{ color: '#6b7280' }}>
                  Your personalized meal planning journey starts here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
