"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.realClick = void 0;
const fireCdpCommand_1 = require("../fireCdpCommand");
const getCypressElementCoordinates_1 = require("../getCypressElementCoordinates");
/** @ignore this, update documentation for this function at index.d.ts */
function realClick(subject, options = {}) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        // prettier-ignore
        const position = options.x && options.y
            ? { x: options.x, y: options.y }
            : options.position;
        const { x, y } = getCypressElementCoordinates_1.getCypressElementCoordinates(subject, position, options.scrollBehavior);
        const log = Cypress.log({
            $el: subject,
            name: "realClick",
            consoleProps: () => ({
                "Applied To": subject.get(0),
                "Absolute Coordinates": { x, y },
            }),
        });
        log.snapshot("before");
        yield fireCdpCommand_1.fireCdpCommand("Input.dispatchMouseEvent", {
            type: "mousePressed",
            x,
            y,
            clickCount: 1,
            buttons: 1,
            pointerType: (_a = options.pointer) !== null && _a !== void 0 ? _a : "mouse",
            button: (_b = options.button) !== null && _b !== void 0 ? _b : "left",
        });
        yield fireCdpCommand_1.fireCdpCommand("Input.dispatchMouseEvent", {
            type: "mouseReleased",
            x,
            y,
            clickCount: 1,
            buttons: 1,
            pointerType: (_c = options.pointer) !== null && _c !== void 0 ? _c : "mouse",
            button: (_d = options.button) !== null && _d !== void 0 ? _d : "left",
        });
        log.snapshot("after").end();
        return subject;
    });
}
exports.realClick = realClick;
