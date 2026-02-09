// api/index.js

import log from './log.js';
import app from '../server.js'; 

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {

    app.listen(3000, () => {
    
    });
}
export default app; 
