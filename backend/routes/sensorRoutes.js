import {Router} from 'express';import {listSensors,getSensor} from '../controllers/sensorController.js';const r=Router();r.get('/',listSensors);r.get('/:id',getSensor);export default r;
