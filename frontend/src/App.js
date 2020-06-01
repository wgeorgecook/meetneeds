import React, { useState } from 'react';
import Needs from './Needs'
import 'antd/dist/antd.css';

function App() {
  const [ user, setUser ] = useState(null)

  return (
    <div className="App">
      <Needs
       user={user}
       onAuthSuccess={(vals) => setUser(vals)}
       onAuthFailure={() => setUser(null)}
      />
    </div>
  );
}

export default App;
