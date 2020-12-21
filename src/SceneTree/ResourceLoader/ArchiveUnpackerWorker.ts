/* eslint-disable require-jsdoc */
/** Synchronously initialize the following scripts in order.
 * @private
*/
const Module = {
    ENVIRONMENT: 'WORKER'
};
const WorkerScope = {};
//--------------------unpackBridge.js----------------------------
// @ts-expect-error ts-migrate(1345) FIXME: An expression of type 'void' cannot be tested for ... Remove this comment to see the full error message
!function (t, e) {
    // The following code has been _carefully_ modified by hand.
    // There were various cases for in what context the code might 
    // be run, and I removed all but the webworker case. 
    // There was code to handle loading in a nodeJS context, that tried to import("fs")
    // WebPack kepts tripping up on that code in its static analysis of the code, so
    // I carefully removed it.
    (t as any).unpackBridge = e((t as any).fs);
}(WorkerScope, function (t: any) {
    return function (t) {
        var e = {};
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        function r(n: any) { if (e[n])
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return e[n].exports; var i = e[n] = { i: n, l: !1, exports: {} }; return t[n].call(i.exports, i, i.exports, r), i.l = !0, i.exports; }
        return r.m = t, r.c = e, r.d = function (t: any, e: any, n: any) { r.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: n }); }, r.r = function (t: any) { "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t, "__esModule", { value: !0 }); }, r.t = function (t: any, e: any) { if (1 & e && (t = r(t)), 8 & e)
            return t; if (4 & e && "object" == typeof t && t && t.__esModule)
            return t; var n = Object.create(null); if (r.r(n), Object.defineProperty(n, "default", { enumerable: !0, value: t }), 2 & e && "string" != typeof t)
            for (var i in t)
                r.d(n, i, function (e: any) { return t[e]; }.bind(null, i)); return n; }, r.n = function (t: any) { var e = t && t.__esModule ? function () { return t.default; } : function () { return t; }; return r.d(e, "a", e), e; }, r.o = function (t: any, e: any) { return Object.prototype.hasOwnProperty.call(t, e); }, r.p = "", r(r.s = 2);
    }([function (t: any, e: any, r: any) {
            "use strict";
            Object.defineProperty(e, "__esModule", { value: !0 });
            const n = r(1), i = { 0: "ERAR_SUCCESS", 10: "ERAR_END_ARCHIVE", 11: "ERAR_NO_MEMORY", 12: "ERAR_BAD_DATA", 13: "ERAR_BAD_ARCHIVE", 14: "ERAR_UNKNOWN_FORMAT", 15: "ERAR_EOPEN", 16: "ERAR_ECREATE", 17: "ERAR_ECLOSE", 18: "ERAR_EREAD", 19: "ERAR_EWRITE", 20: "ERAR_SMALL_BUF", 21: "ERAR_UNKNOWN", 22: "ERAR_MISSING_PASSWORD", 23: "ERAR_EREFERENCE", 24: "ERAR_BAD_PASSWORD" }, o = { 0: "Success", 11: "Not enough memory", 12: "Archive header or data are damaged", 13: "File is not RAR archive", 14: "Unknown archive format", 15: "File open error", 16: "File create error", 17: "File close error", 18: "File read error", 19: "File write error", 20: "Buffer for archive comment is too small, comment truncated", 21: "Unknown error", 22: "Password for encrypted file or header is not specified", 23: "Cannot open file source for reference record", 24: "Wrong password is specified" };
            class s {
                _archive: any;
                _filePath: any;
                _lastFileContent: any;
                _password: any;
                closeFile: any;
                constructor(t = "") { this._password = t, this._archive = null; }
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                getFileList() { let t, [e, r] = this.openArc(!0); if ("SUCCESS" !== e.state)
                    t = [e, null];
                else {
                    let e, n, i = [];
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    for (; [e, n] = this.processNextFile(() => !0), "SUCCESS" === e.state;)
                        i.push((n as any).fileHeader);
                    t = "ERAR_END_ARCHIVE" !== (e as any).reason ? [e, null] : [{ state: "SUCCESS" }, { arcHeader: r, fileHeaders: i }];
                } return this.closeArc(), t; }
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                extractAll() { let t, [e, r] = this.openArc(!1); if ("SUCCESS" !== e.state)
                    t = [e, null];
                else {
                    let e, n, i = [];
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    for (; [e, n] = this.processNextFile(() => !1), "SUCCESS" === e.state;)
                        i.push(n);
                    t = "ERAR_END_ARCHIVE" !== (e as any).reason ? [e, null] : [{ state: "SUCCESS" }, { arcHeader: r, files: i }];
                } return this.closeArc(), t; }
                extractFiles(t: any, e: any) { let r, [n, i] = this.openArc(!1, e), o = {}; for (let e = 0; e < t.length; ++e)
                    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                    o[t[e]] = e; if ("SUCCESS" !== n.state)
                    r = [n, null];
                else {
                    let e, n, s = Array(t.length).fill(null), u = 0;
                    for (;;) {
                        let r = !1, i = null;
                        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                        if ([e, n] = this.processNextFile((t: any) => t in o ? (i = o[t], !1) : (r = !0, !0)), "SUCCESS" !== e.state)
                            break;
                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'null' cannot be used as an index type.
                        if (!r && (s[i] = n, ++u === t.length)) {
                            (e as any).reason = "ERAR_END_ARCHIVE";
                            break;
                        }
                    }
                    r = "ERAR_END_ARCHIVE" !== (e as any).reason ? [e, null] : [{ state: "SUCCESS" }, { arcHeader: i, files: s }];
                } return this.closeArc(), r; }
                fileCreated(t: any) { }
                close(t: any) { this._lastFileContent = this.closeFile(t); }
                openArc(t: any, e: any) { n.Ext.current = this, this._archive = new unpack.RarArchive; let r, i = this._archive.open(this._filePath, e || this._password, t); return r = 0 !== i.state.errCode ? [this.getFailInfo(i.state.errCode, i.state.errType), null] : [{ state: "SUCCESS" }, { comment: i.comment, flags: { volume: 0 != (1 & i.flags), lock: 0 != (4 & i.flags), solid: 0 != (8 & i.flags), authInfo: 0 != (32 & i.flags), recoveryRecord: 0 != (64 & i.flags), headerEncrypted: 0 != (128 & i.flags) } }], n.Ext.current = null, r; }
                processNextFile(t: any) { let e; n.Ext.current = this; let r = this._archive.getFileHeader(), i = [{ state: "SUCCESS" }, null]; if (0 === r.state.errCode) {
                    let e = t(r.name);
                    this._lastFileContent = null;
                    let n = this._archive.readFile(e);
                    0 === n.errCode || e || (i[0] = this.getFailInfo(n.errCode, n.errType), 22 === n.errCode ? n = this._archive.readFile(!0) : n.errCode = 0), 0 === n.errCode ? i[1] = this._lastFileContent : (r.state.errCode = n.errCode, r.state.errType = n.errType), this._lastFileContent = null;
                } return e = 0 !== r.state.errCode ? [this.getFailInfo(r.state.errCode, r.state.errType), null] : [{ state: "SUCCESS" }, { fileHeader: { name: r.name, flags: { encrypted: 0 != (4 & r.flags), solid: 0 != (16 & r.flags), directory: 0 != (32 & r.flags) }, packSize: r.packSize, unpSize: r.unpSize, crc: r.crc, time: function (t) { const e = [5, 6, 5, 5, 4, 7]; let r = []; for (let n of e)
                                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                                r.push(t & (1 << n) - 1), t >>= n; let n = (t: any) => t < 10 ? "0" + t : "" + t; return `${1980 + (r = r.reverse())[0]}-${n(r[1])}-${n(r[2])}` + `T${n(r[3])}:${n(r[4])}:${n(2 * r[5])}.000`; }(r.time), unpVer: `${Math.floor(r.unpVer / 10)}.${r.unpVer % 10}`, method: function (t) { return { 48: "Storing", 49: "Fastest", 50: "Fast", 51: "Normal", 52: "Good", 53: "Best" }[t] || "Unknown"; }(r.method) }, extract: i }], n.Ext.current = null, e; }
                closeArc() { n.Ext.current = this, this._archive.delete(), n.Ext.current = null, this._archive = null; }
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                getFailInfo(t: any, e: any) { return { state: "FAIL", reason: i[t], msg: o[t] }; }
            }
            (s as any)._current = null, e.Extractor = s;
        }, function (t: any, e: any, r: any) {
            "use strict";
            Object.defineProperty(e, "__esModule", { value: !0 }), e.Ext = { current: null };
        }, function (t: any, e: any, r: any) {
            "use strict";
            Object.defineProperty(e, "__esModule", { value: !0 }), function (t) { for (var r in t)
                e.hasOwnProperty(r) || (e[r] = t[r]); }(r(3));
            var n = r(1);
            e.Ext = n.Ext;
        }, function (t: any, e: any, r: any) {
            "use strict";
            Object.defineProperty(e, "__esModule", { value: !0 });
            const n = r(4), i = r(6);
            e.createExtractorFromData = function (t: any, e = "") { return new n.DataExtractor(t, e); }, e.createExtractorFromFile = function (t: any, e = "", r = "") { return new i.FileExtractor(t, e, r); };
        }, function (t: any, e: any, r: any) {
            "use strict";
            Object.defineProperty(e, "__esModule", { value: !0 });
            const n = r(5), i = r(0);
            e.DataExtractor = class extends i.Extractor {
                constructor(t: any, e: any) { super(e), this.dataFiles = {}, this.dataFileMap = {}, this.currentFd = 1; let r = { file: new n.DataFile(new Uint8Array(t)), fd: this.currentFd++ }; this._filePath = "_defaultUnrarJS_.rar", this.dataFiles[this._filePath] = r, this.dataFileMap[r.fd] = this._filePath; }
                open(t: any) { let e = this.dataFiles[t]; return e ? e.fd : 0; }
                create(t: any) { let e = this.currentFd++; return this.dataFiles[t] = { file: new n.DataFile, fd: this.currentFd++ }, this.dataFileMap[e] = t, e; }
                closeFile(t: any) { let e = this.dataFiles[this.dataFileMap[t]]; if (!e)
                    return null; let r = e.file.readAll(); return 1 !== t ? (delete this.dataFiles[this.dataFileMap[t]], delete this.dataFileMap[t]) : e.file.seek(0, "SET"), r; }
                read(t: any, e: any, r: any) { let n = this.dataFiles[this.dataFileMap[t]]; if (!n)
                    return -1; let i = n.file.read(r); return null === i ? -1 : (unpack.HEAPU8.set(i, e), i.byteLength); }
                write(t: any, e: any, r: any) { let n = this.dataFiles[this.dataFileMap[t]]; return !!n && (n.file.write(unpack.HEAPU8.slice(e, e + r)), !0); }
                tell(t: any) { let e = this.dataFiles[this.dataFileMap[t]]; return e ? e.file.tell() : -1; }
                seek(t: any, e: any, r: any) { let n = this.dataFiles[this.dataFileMap[t]]; return !!n && n.file.seek(e, r); }
            };
        }, function (t: any, e: any, r: any) {
            "use strict";
            Object.defineProperty(e, "__esModule", { value: !0 });
            e.DataFile = class {
                buffers: any;
                pos: any;
                size: any;
                constructor(t: any) { this.buffers = [], this.pos = 0, this.size = 0, t && (this.buffers.push(t), this.size = t.byteLength, this.pos = 0); }
                read(t: any) { if (this.flatten(), t + this.pos > this.size)
                    return null; let e = this.pos; return this.pos += t, this.buffers[0].slice(e, this.pos); }
                readAll() { return this.flatten(), this.buffers[0]; }
                write(t: any) { return this.buffers.push(t), this.size += t.byteLength, this.pos += t.byteLength, !0; }
                tell() { return this.pos; }
                seek(t: any, e: any) { let r = this.pos; return "SET" === e ? r = t : "CUR" === e ? r += t : r = this.size - t, !(r < 0 || r > this.size || (this.pos = r, 0)); }
                flatten() { if (this.buffers.length <= 1)
                    return; let t = new Uint8Array(this.size), e = 0; for (let r of this.buffers)
                    t.set(r, e), e += r.byteLength; this.buffers = [t]; }
            };
        }, function (t: any, e: any, r: any) {
            "use strict";
            (function (t: any) { Object.defineProperty(e, "__esModule", { value: !0 }); const n = r(12), i = r(13), o = r(0); e.FileExtractor = class extends o.Extractor {
                constructor(t: any, e: any, r: any) { super(r), this._filePath = t, this.fileMap = {}, this._target = e; }
                open(t: any) { let e = n.openSync(t, "r"); return this.fileMap[e] = { size: n.fstatSync(e).size, pos: 0, name: t }, e; }
                create(t: any) { let e = i.join(this._target, t); i.parse(e).dir.split("/").reduce((t: any, e: any) => (t += e + "/", n.existsSync(t) || n.mkdirSync(t), t), ""); let r = n.openSync(e, "w"); return this.fileMap[r] = { size: 0, pos: 0, name: t }, r; }
                closeFile(t: any) { return delete this.fileMap[t], n.closeSync(t), null; }
                read(e: any, r: any, i: any) { let o = this.fileMap[e], s = new t(i), u = n.readSync(e, s, 0, i, o.pos); return unpack.HEAPU8.set(s, r), o.pos += u, u; }
                write(e: any, r: any, i: any) { let o = this.fileMap[e], s = n.writeSync(e, new t(unpack.HEAPU8.subarray(r, r + i)), 0, i); return o.pos += s, o.size += s, s === i; }
                tell(t: any) { return this.fileMap[t].pos; }
                seek(t: any, e: any, r: any) { let n = this.fileMap[t], i = n.pos; return "SET" === r ? i = 0 : "END" === r && (i = n.size), !((i += e) < 0 || i > n.size || (n.pos = i, 0)); }
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            }; }).call(this, r(7).Buffer);
        }, function (t: any, e: any, r: any) {
            "use strict";
            (function (t: any) {
                /*!
                 * The buffer module from node.js, for the browser.
                 *
                 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
                 * @license  MIT
                 */
                var n = r(9), i = r(10), o = r(11);
                function s() { return a.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823; }
                function u(t: any, e: any) { if (s() < e)
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                    throw new RangeError("Invalid typed array length"); return a.TYPED_ARRAY_SUPPORT ? ((t = new Uint8Array(e)) as any).__proto__ = a.prototype : (null === t && (t = new a(e)), t.length = e), t; }
                // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                function a(t: any, e: any, r: any) { if (!(a.TYPED_ARRAY_SUPPORT || this instanceof a))
                    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                    return new a(t, e, r); if ("number" == typeof t) {
                    if ("string" == typeof e)
                        throw new Error("If encoding is specified then the first argument must be a string");
                    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                    return l(this, t);
                // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                } return f(this, t, e, r); }
                function f(t: any, e: any, r: any, n: any) { if ("number" == typeof e)
                    throw new TypeError('"value" argument must not be a number'); return "undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer ? function (t, e, r, n) { if (e.byteLength, r < 0 || e.byteLength < r)
                    throw new RangeError("'offset' is out of bounds"); if (e.byteLength < r + (n || 0))
                    throw new RangeError("'length' is out of bounds"); e = void 0 === r && void 0 === n ? new Uint8Array(e) : void 0 === n ? new Uint8Array(e, r) : new Uint8Array(e, r, n); a.TYPED_ARRAY_SUPPORT ? ((t = e) as any).__proto__ = a.prototype : t = c(t, e); return t; }(t, e, r, n) : "string" == typeof e ? function (t, e, r) { "string" == typeof r && "" !== r || (r = "utf8"); if (!a.isEncoding(r))
                    throw new TypeError('"encoding" must be a valid string encoding'); var n = 0 | g(e, r), i = (t = u(t, n)).write(e, r); i !== n && (t = t.slice(0, i)); return t; }(t, e, r) : function (t, e) { if (a.isBuffer(e)) {
                    var r = 0 | p(e.length);
                    return 0 === (t = u(t, r)).length ? t : (e.copy(t, 0, 0, r), t);
                } if (e) {
                    if ("undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer || "length" in e)
                        return "number" != typeof e.length || function (t) { return t != t; }(e.length) ? u(t, 0) : c(t, e);
                    if ("Buffer" === e.type && o(e.data))
                        return c(t, e.data);
                } throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object."); }(t, e); }
                function h(t: any) { if ("number" != typeof t)
                    throw new TypeError('"size" argument must be a number'); if (t < 0)
                    throw new RangeError('"size" argument must not be negative'); }
                function l(t: any, e: any) { if (h(e), t = u(t, e < 0 ? 0 : 0 | p(e)), !a.TYPED_ARRAY_SUPPORT)
                    for (var r = 0; r < e; ++r)
                        t[r] = 0; return t; }
                function c(t: any, e: any) { var r = e.length < 0 ? 0 : 0 | p(e.length); t = u(t, r); for (var n = 0; n < r; n += 1)
                    t[n] = 255 & e[n]; return t; }
                function p(t: any) { if (t >= s())
                    throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + s().toString(16) + " bytes"); return 0 | t; }
                function g(t: any, e: any) { if (a.isBuffer(t))
                    return t.length; if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(t) || t instanceof ArrayBuffer))
                    return t.byteLength; "string" != typeof t && (t = "" + t); var r = t.length; if (0 === r)
                    return 0; for (var n = !1;;)
                    switch (e) {
                        case "ascii":
                        case "latin1":
                        case "binary": return r;
                        case "utf8":
                        case "utf-8":
                        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                        case void 0: return k(t).length;
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le": return 2 * r;
                        case "hex": return r >>> 1;
                        case "base64": return j(t).length;
                        default:
                            if (n)
                                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                                return k(t).length;
                            e = ("" + e).toLowerCase(), n = !0;
                    } }
                function d(t: any, e: any, r: any) { var n = t[e]; t[e] = t[r], t[r] = n; }
                function y(t: any, e: any, r: any, n: any, i: any) { if (0 === t.length)
                    return -1; if ("string" == typeof r ? (n = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), r = +r, isNaN(r) && (r = i ? 0 : t.length - 1), r < 0 && (r = t.length + r), r >= t.length) {
                    if (i)
                        return -1;
                    r = t.length - 1;
                }
                else if (r < 0) {
                    if (!i)
                        return -1;
                    r = 0;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                } if ("string" == typeof e && (e = a.from(e, n)), a.isBuffer(e))
                    return 0 === e.length ? -1 : w(t, e, r, n, i); if ("number" == typeof e)
                    return e &= 255, a.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? i ? Uint8Array.prototype.indexOf.call(t, e, r) : Uint8Array.prototype.lastIndexOf.call(t, e, r) : w(t, [e], r, n, i); throw new TypeError("val must be string, number or Buffer"); }
                function w(t: any, e: any, r: any, n: any, i: any) { var o, s = 1, u = t.length, a = e.length; if (void 0 !== n && ("ucs2" === (n = String(n).toLowerCase()) || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
                    if (t.length < 2 || e.length < 2)
                        return -1;
                    s = 2, u /= 2, a /= 2, r /= 2;
                } function f(t: any, e: any) { return 1 === s ? t[e] : t.readUInt16BE(e * s); } if (i) {
                    var h = -1;
                    for (o = r; o < u; o++)
                        if (f(t, o) === f(e, -1 === h ? 0 : o - h)) {
                            if (-1 === h && (h = o), o - h + 1 === a)
                                return h * s;
                        }
                        else
                            -1 !== h && (o -= o - h), h = -1;
                }
                else
                    for (r + a > u && (r = u - a), o = r; o >= 0; o--) {
                        for (var l = !0, c = 0; c < a; c++)
                            if (f(t, o + c) !== f(e, c)) {
                                l = !1;
                                break;
                            }
                        if (l)
                            return o;
                    } return -1; }
                function E(t: any, e: any, r: any, n: any) { r = Number(r) || 0; var i = t.length - r; n ? (n = Number(n)) > i && (n = i) : n = i; var o = e.length; if (o % 2 != 0)
                    throw new TypeError("Invalid hex string"); n > o / 2 && (n = o / 2); for (var s = 0; s < n; ++s) {
                    var u = parseInt(e.substr(2 * s, 2), 16);
                    if (isNaN(u))
                        return s;
                    t[r + s] = u;
                } return s; }
                function v(t: any, e: any, r: any, n: any) { return z(k(e, t.length - r), t, r, n); }
                function A(t: any, e: any, r: any, n: any) { return z(function (t) { for (var e = [], r = 0; r < t.length; ++r)
                    e.push(255 & t.charCodeAt(r)); return e; }(e), t, r, n); }
                function _(t: any, e: any, r: any, n: any) { return A(t, e, r, n); }
                function b(t: any, e: any, r: any, n: any) { return z(j(e), t, r, n); }
                function m(t: any, e: any, r: any, n: any) { return z(function (t, e) { for (var r, n, i, o = [], s = 0; s < t.length && !((e -= 2) < 0); ++s)
                    r = t.charCodeAt(s), n = r >> 8, i = r % 256, o.push(i), o.push(n); return o; }(e, t.length - r), t, r, n); }
                function R(t: any, e: any, r: any) { return 0 === e && r === t.length ? n.fromByteArray(t) : n.fromByteArray(t.slice(e, r)); }
                function S(t: any, e: any, r: any) { r = Math.min(t.length, r); for (var n = [], i = e; i < r;) {
                    var o, s, u, a, f = t[i], h = null, l = f > 239 ? 4 : f > 223 ? 3 : f > 191 ? 2 : 1;
                    if (i + l <= r)
                        switch (l) {
                            case 1:
                                f < 128 && (h = f);
                                break;
                            case 2:
                                128 == (192 & (o = t[i + 1])) && (a = (31 & f) << 6 | 63 & o) > 127 && (h = a);
                                break;
                            case 3:
                                o = t[i + 1], s = t[i + 2], 128 == (192 & o) && 128 == (192 & s) && (a = (15 & f) << 12 | (63 & o) << 6 | 63 & s) > 2047 && (a < 55296 || a > 57343) && (h = a);
                                break;
                            case 4: o = t[i + 1], s = t[i + 2], u = t[i + 3], 128 == (192 & o) && 128 == (192 & s) && 128 == (192 & u) && (a = (15 & f) << 18 | (63 & o) << 12 | (63 & s) << 6 | 63 & u) > 65535 && a < 1114112 && (h = a);
                        }
                    null === h ? (h = 65533, l = 1) : h > 65535 && (h -= 65536, n.push(h >>> 10 & 1023 | 55296), h = 56320 | 1023 & h), n.push(h), i += l;
                } return function (t) { var e = t.length; if (e <= T)
                    return String.fromCharCode.apply(String, t); var r = "", n = 0; for (; n < e;)
                    r += String.fromCharCode.apply(String, t.slice(n, n += T)); return r; }(n); }
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                e.Buffer = a, e.SlowBuffer = function (t: any) { +t != t && (t = 0); return a.alloc(+t); }, e.INSPECT_MAX_BYTES = 50, a.TYPED_ARRAY_SUPPORT = void 0 !== t.TYPED_ARRAY_SUPPORT ? t.TYPED_ARRAY_SUPPORT : function () { try {
                    var t = new Uint8Array(1);
                    return (t as any).__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42; } }, 42 === (t as any).foo() && "function" == typeof t.subarray && 0 === t.subarray(1, 1).byteLength;
                }
                catch (t) {
                    return !1;
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                } }(), e.kMaxLength = s(), a.poolSize = 8192, a._augment = function (t: any) { return t.__proto__ = a.prototype, t; }, a.from = function (t: any, e: any, r: any) { return f(null, t, e, r); }, a.TYPED_ARRAY_SUPPORT && (a.prototype.__proto__ = Uint8Array.prototype, a.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && a[Symbol.species] === a && Object.defineProperty(a, Symbol.species, { value: null, configurable: !0 })), a.alloc = function (t: any, e: any, r: any) { return function (t, e, r, n) { return h(e), e <= 0 ? u(t, e) : void 0 !== r ? "string" == typeof n ? u(t, e).fill(r, n) : u(t, e).fill(r) : u(t, e); }(null, t, e, r); }, a.allocUnsafe = function (t: any) { return l(null, t); }, a.allocUnsafeSlow = function (t: any) { return l(null, t); }, a.isBuffer = function (t: any) { return !(null == t || !t._isBuffer); }, a.compare = function (t: any, e: any) { if (!a.isBuffer(t) || !a.isBuffer(e))
                    throw new TypeError("Arguments must be Buffers"); if (t === e)
                    return 0; for (var r = t.length, n = e.length, i = 0, o = Math.min(r, n); i < o; ++i)
                    if (t[i] !== e[i]) {
                        r = t[i], n = e[i];
                        break;
                    } return r < n ? -1 : n < r ? 1 : 0; }, a.isEncoding = function (t: any) { switch (String(t).toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "latin1":
                    case "binary":
                    case "base64":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le": return !0;
                    default: return !1;
                } }, a.concat = function (t: any, e: any) { if (!o(t))
                    throw new TypeError('"list" argument must be an Array of Buffers'); if (0 === t.length)
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 1.
                    return a.alloc(0); var r; if (void 0 === e)
                    for (e = 0, r = 0; r < t.length; ++r)
                        e += t[r].length; var n = a.allocUnsafe(e), i = 0; for (r = 0; r < t.length; ++r) {
                    // @ts-expect-error ts-migrate(7022) FIXME: 's' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
                    var s = t[r];
                    if (!a.isBuffer(s))
                        throw new TypeError('"list" argument must be an Array of Buffers');
                    s.copy(n, i), i += s.length;
                } return n; }, a.byteLength = g, a.prototype._isBuffer = !0, a.prototype.swap16 = function () { var t = this.length; if (t % 2 != 0)
                    throw new RangeError("Buffer size must be a multiple of 16-bits"); for (var e = 0; e < t; e += 2)
                    d(this, e, e + 1); return this; }, a.prototype.swap32 = function () { var t = this.length; if (t % 4 != 0)
                    throw new RangeError("Buffer size must be a multiple of 32-bits"); for (var e = 0; e < t; e += 4)
                    d(this, e, e + 3), d(this, e + 1, e + 2); return this; }, a.prototype.swap64 = function () { var t = this.length; if (t % 8 != 0)
                    throw new RangeError("Buffer size must be a multiple of 64-bits"); for (var e = 0; e < t; e += 8)
                    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                    d(this, e, e + 7), d(this, e + 1, e + 6), d(this, e + 2, e + 5), d(this, e + 3, e + 4); return this; }, a.prototype.toString = function () { var t = 0 | this.length; return 0 === t ? "" : 0 === arguments.length ? S(this, 0, t) : function (t: any, e: any, r: any) { var n = !1; if ((void 0 === e || e < 0) && (e = 0), e > this.length)
                    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                    return ""; if ((void 0 === r || r > this.length) && (r = this.length), r <= 0)
                    return ""; if ((r >>>= 0) <= (e >>>= 0))
                    return ""; for (t || (t = "utf8");;)
                    switch (t) {
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        case "hex": return U(this, e, r);
                        case "utf8":
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        case "utf-8": return S(this, e, r);
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        case "ascii": return P(this, e, r);
                        case "latin1":
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        case "binary": return C(this, e, r);
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        case "base64": return R(this, e, r);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        case "utf-16le": return B(this, e, r);
                        default:
                            if (n)
                                throw new TypeError("Unknown encoding: " + t);
                            t = (t + "").toLowerCase(), n = !0;
                    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
                    } }.apply(this, arguments); }, a.prototype.equals = function (t: any) { if (!a.isBuffer(t))
                    throw new TypeError("Argument must be a Buffer"); return this === t || 0 === a.compare(this, t); }, a.prototype.inspect = function () { var t = "", r = e.INSPECT_MAX_BYTES; return this.length > 0 && (t = this.toString("hex", 0, r).match(/.{2}/g).join(" "), this.length > r && (t += " ... ")), "<Buffer " + t + ">"; }, a.prototype.compare = function (t: any, e: any, r: any, n: any, i: any) { if (!a.isBuffer(t))
                    throw new TypeError("Argument must be a Buffer"); if (void 0 === e && (e = 0), void 0 === r && (r = t ? t.length : 0), void 0 === n && (n = 0), void 0 === i && (i = this.length), e < 0 || r > t.length || n < 0 || i > this.length)
                    throw new RangeError("out of range index"); if (n >= i && e >= r)
                    return 0; if (n >= i)
                    return -1; if (e >= r)
                    return 1; if (e >>>= 0, r >>>= 0, n >>>= 0, i >>>= 0, this === t)
                    return 0; for (var o = i - n, s = r - e, u = Math.min(o, s), f = this.slice(n, i), h = t.slice(e, r), l = 0; l < u; ++l)
                    if (f[l] !== h[l]) {
                        o = f[l], s = h[l];
                        break;
                    } return o < s ? -1 : s < o ? 1 : 0; }, a.prototype.includes = function (t: any, e: any, r: any) { return -1 !== this.indexOf(t, e, r); }, a.prototype.indexOf = function (t: any, e: any, r: any) { return y(this, t, e, r, !0); }, a.prototype.lastIndexOf = function (t: any, e: any, r: any) { return y(this, t, e, r, !1); }, a.prototype.write = function (t: any, e: any, r: any, n: any) { if (void 0 === e)
                    n = "utf8", r = this.length, e = 0;
                else if (void 0 === r && "string" == typeof e)
                    n = e, r = this.length, e = 0;
                else {
                    if (!isFinite(e))
                        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                    e |= 0, isFinite(r) ? (r |= 0, void 0 === n && (n = "utf8")) : (n = r, r = void 0);
                } var i = this.length - e; if ((void 0 === r || r > i) && (r = i), t.length > 0 && (r < 0 || e < 0) || e > this.length)
                    throw new RangeError("Attempt to write outside buffer bounds"); n || (n = "utf8"); for (var o = !1;;)
                    switch (n) {
                        case "hex": return E(this, t, e, r);
                        case "utf8":
                        case "utf-8": return v(this, t, e, r);
                        case "ascii": return A(this, t, e, r);
                        case "latin1":
                        case "binary": return _(this, t, e, r);
                        case "base64": return b(this, t, e, r);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le": return m(this, t, e, r);
                        default:
                            if (o)
                                throw new TypeError("Unknown encoding: " + n);
                            n = ("" + n).toLowerCase(), o = !0;
                    } }, a.prototype.toJSON = function () { return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) }; };
                var T = 4096;
                function P(t: any, e: any, r: any) { var n = ""; r = Math.min(t.length, r); for (var i = e; i < r; ++i)
                    n += String.fromCharCode(127 & t[i]); return n; }
                function C(t: any, e: any, r: any) { var n = ""; r = Math.min(t.length, r); for (var i = e; i < r; ++i)
                    n += String.fromCharCode(t[i]); return n; }
                function U(t: any, e: any, r: any) { var n = t.length; (!e || e < 0) && (e = 0), (!r || r < 0 || r > n) && (r = n); for (var i = "", o = e; o < r; ++o)
                    i += N(t[o]); return i; }
                function B(t: any, e: any, r: any) { for (var n = t.slice(e, r), i = "", o = 0; o < n.length; o += 2)
                    i += String.fromCharCode(n[o] + 256 * n[o + 1]); return i; }
                function F(t: any, e: any, r: any) { if (t % 1 != 0 || t < 0)
                    throw new RangeError("offset is not uint"); if (t + e > r)
                    throw new RangeError("Trying to access beyond buffer length"); }
                function M(t: any, e: any, r: any, n: any, i: any, o: any) { if (!a.isBuffer(t))
                    throw new TypeError('"buffer" argument must be a Buffer instance'); if (e > i || e < o)
                    throw new RangeError('"value" argument is out of bounds'); if (r + n > t.length)
                    throw new RangeError("Index out of range"); }
                function x(t: any, e: any, r: any, n: any) { e < 0 && (e = 65535 + e + 1); for (var i = 0, o = Math.min(t.length - r, 2); i < o; ++i)
                    t[r + i] = (e & 255 << 8 * (n ? i : 1 - i)) >>> 8 * (n ? i : 1 - i); }
                function I(t: any, e: any, r: any, n: any) { e < 0 && (e = 4294967295 + e + 1); for (var i = 0, o = Math.min(t.length - r, 4); i < o; ++i)
                    t[r + i] = e >>> 8 * (n ? i : 3 - i) & 255; }
                function O(t: any, e: any, r: any, n: any, i: any, o: any) { if (r + n > t.length)
                    throw new RangeError("Index out of range"); if (r < 0)
                    throw new RangeError("Index out of range"); }
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 6 arguments, but got 4.
                function Y(t: any, e: any, r: any, n: any, o: any) { return o || O(t, 0, r, 4), i.write(t, e, r, n, 23, 4), r + 4; }
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 6 arguments, but got 4.
                function L(t: any, e: any, r: any, n: any, o: any) { return o || O(t, 0, r, 8), i.write(t, e, r, n, 52, 8), r + 8; }
                a.prototype.slice = function (t: any, e: any) { var r, n = this.length; if (t = ~~t, e = void 0 === e ? n : ~~e, t < 0 ? (t += n) < 0 && (t = 0) : t > n && (t = n), e < 0 ? (e += n) < 0 && (e = 0) : e > n && (e = n), e < t && (e = t), a.TYPED_ARRAY_SUPPORT)
                    (r = this.subarray(t, e)).__proto__ = a.prototype;
                else {
                    var i = e - t;
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                    r = new a(i, void 0);
                    for (var o = 0; o < i; ++o)
                        r[o] = this[o + t];
                } return r; }, a.prototype.readUIntLE = function (t: any, e: any, r: any) { t |= 0, e |= 0, r || F(t, e, this.length); for (var n = this[t], i = 1, o = 0; ++o < e && (i *= 256);)
                    n += this[t + o] * i; return n; }, a.prototype.readUIntBE = function (t: any, e: any, r: any) { t |= 0, e |= 0, r || F(t, e, this.length); for (var n = this[t + --e], i = 1; e > 0 && (i *= 256);)
                    n += this[t + --e] * i; return n; }, a.prototype.readUInt8 = function (t: any, e: any) { return e || F(t, 1, this.length), this[t]; }, a.prototype.readUInt16LE = function (t: any, e: any) { return e || F(t, 2, this.length), this[t] | this[t + 1] << 8; }, a.prototype.readUInt16BE = function (t: any, e: any) { return e || F(t, 2, this.length), this[t] << 8 | this[t + 1]; }, a.prototype.readUInt32LE = function (t: any, e: any) { return e || F(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3]; }, a.prototype.readUInt32BE = function (t: any, e: any) { return e || F(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]); }, a.prototype.readIntLE = function (t: any, e: any, r: any) { t |= 0, e |= 0, r || F(t, e, this.length); for (var n = this[t], i = 1, o = 0; ++o < e && (i *= 256);)
                    n += this[t + o] * i; return n >= (i *= 128) && (n -= Math.pow(2, 8 * e)), n; }, a.prototype.readIntBE = function (t: any, e: any, r: any) { t |= 0, e |= 0, r || F(t, e, this.length); for (var n = e, i = 1, o = this[t + --n]; n > 0 && (i *= 256);)
                    o += this[t + --n] * i; return o >= (i *= 128) && (o -= Math.pow(2, 8 * e)), o; }, a.prototype.readInt8 = function (t: any, e: any) { return e || F(t, 1, this.length), 128 & this[t] ? -1 * (255 - this[t] + 1) : this[t]; }, a.prototype.readInt16LE = function (t: any, e: any) { e || F(t, 2, this.length); var r = this[t] | this[t + 1] << 8; return 32768 & r ? 4294901760 | r : r; }, a.prototype.readInt16BE = function (t: any, e: any) { e || F(t, 2, this.length); var r = this[t + 1] | this[t] << 8; return 32768 & r ? 4294901760 | r : r; }, a.prototype.readInt32LE = function (t: any, e: any) { return e || F(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24; }, a.prototype.readInt32BE = function (t: any, e: any) { return e || F(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]; }, a.prototype.readFloatLE = function (t: any, e: any) { return e || F(t, 4, this.length), i.read(this, t, !0, 23, 4); }, a.prototype.readFloatBE = function (t: any, e: any) { return e || F(t, 4, this.length), i.read(this, t, !1, 23, 4); }, a.prototype.readDoubleLE = function (t: any, e: any) { return e || F(t, 8, this.length), i.read(this, t, !0, 52, 8); }, a.prototype.readDoubleBE = function (t: any, e: any) { return e || F(t, 8, this.length), i.read(this, t, !1, 52, 8); }, a.prototype.writeUIntLE = function (t: any, e: any, r: any, n: any) { (t = +t, e |= 0, r |= 0, n) || M(this, t, e, r, Math.pow(2, 8 * r) - 1, 0); var i = 1, o = 0; for (this[e] = 255 & t; ++o < r && (i *= 256);)
                    this[e + o] = t / i & 255; return e + r; }, a.prototype.writeUIntBE = function (t: any, e: any, r: any, n: any) { (t = +t, e |= 0, r |= 0, n) || M(this, t, e, r, Math.pow(2, 8 * r) - 1, 0); var i = r - 1, o = 1; for (this[e + i] = 255 & t; --i >= 0 && (o *= 256);)
                    this[e + i] = t / o & 255; return e + r; }, a.prototype.writeUInt8 = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 1, 255, 0), a.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[e] = 255 & t, e + 1; }, a.prototype.writeUInt16LE = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 2, 65535, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : x(this, t, e, !0), e + 2; }, a.prototype.writeUInt16BE = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 2, 65535, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : x(this, t, e, !1), e + 2; }, a.prototype.writeUInt32LE = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 4, 4294967295, 0), a.TYPED_ARRAY_SUPPORT ? (this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = 255 & t) : I(this, t, e, !0), e + 4; }, a.prototype.writeUInt32BE = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 4, 4294967295, 0), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : I(this, t, e, !1), e + 4; }, a.prototype.writeIntLE = function (t: any, e: any, r: any, n: any) { if (t = +t, e |= 0, !n) {
                    var i = Math.pow(2, 8 * r - 1);
                    M(this, t, e, r, i - 1, -i);
                } var o = 0, s = 1, u = 0; for (this[e] = 255 & t; ++o < r && (s *= 256);)
                    t < 0 && 0 === u && 0 !== this[e + o - 1] && (u = 1), this[e + o] = (t / s >> 0) - u & 255; return e + r; }, a.prototype.writeIntBE = function (t: any, e: any, r: any, n: any) { if (t = +t, e |= 0, !n) {
                    var i = Math.pow(2, 8 * r - 1);
                    M(this, t, e, r, i - 1, -i);
                } var o = r - 1, s = 1, u = 0; for (this[e + o] = 255 & t; --o >= 0 && (s *= 256);)
                    t < 0 && 0 === u && 0 !== this[e + o + 1] && (u = 1), this[e + o] = (t / s >> 0) - u & 255; return e + r; }, a.prototype.writeInt8 = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 1, 127, -128), a.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), t < 0 && (t = 255 + t + 1), this[e] = 255 & t, e + 1; }, a.prototype.writeInt16LE = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 2, 32767, -32768), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : x(this, t, e, !0), e + 2; }, a.prototype.writeInt16BE = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 2, 32767, -32768), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : x(this, t, e, !1), e + 2; }, a.prototype.writeInt32LE = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 4, 2147483647, -2147483648), a.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24) : I(this, t, e, !0), e + 4; }, a.prototype.writeInt32BE = function (t: any, e: any, r: any) { return t = +t, e |= 0, r || M(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), a.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : I(this, t, e, !1), e + 4; }, a.prototype.writeFloatLE = function (t: any, e: any, r: any) { return Y(this, t, e, !0, r); }, a.prototype.writeFloatBE = function (t: any, e: any, r: any) { return Y(this, t, e, !1, r); }, a.prototype.writeDoubleLE = function (t: any, e: any, r: any) { return L(this, t, e, !0, r); }, a.prototype.writeDoubleBE = function (t: any, e: any, r: any) { return L(this, t, e, !1, r); }, a.prototype.copy = function (t: any, e: any, r: any, n: any) { if (r || (r = 0), n || 0 === n || (n = this.length), e >= t.length && (e = t.length), e || (e = 0), n > 0 && n < r && (n = r), n === r)
                    return 0; if (0 === t.length || 0 === this.length)
                    return 0; if (e < 0)
                    throw new RangeError("targetStart out of bounds"); if (r < 0 || r >= this.length)
                    throw new RangeError("sourceStart out of bounds"); if (n < 0)
                    throw new RangeError("sourceEnd out of bounds"); n > this.length && (n = this.length), t.length - e < n - r && (n = t.length - e + r); var i, o = n - r; if (this === t && r < e && e < n)
                    for (i = o - 1; i >= 0; --i)
                        t[i + e] = this[i + r];
                else if (o < 1e3 || !a.TYPED_ARRAY_SUPPORT)
                    for (i = 0; i < o; ++i)
                        t[i + e] = this[i + r];
                else
                    Uint8Array.prototype.set.call(t, this.subarray(r, r + o), e); return o; }, a.prototype.fill = function (t: any, e: any, r: any, n: any) { if ("string" == typeof t) {
                    if ("string" == typeof e ? (n = e, e = 0, r = this.length) : "string" == typeof r && (n = r, r = this.length), 1 === t.length) {
                        var i = t.charCodeAt(0);
                        i < 256 && (t = i);
                    }
                    if (void 0 !== n && "string" != typeof n)
                        throw new TypeError("encoding must be a string");
                    if ("string" == typeof n && !a.isEncoding(n))
                        throw new TypeError("Unknown encoding: " + n);
                }
                else
                    "number" == typeof t && (t &= 255); if (e < 0 || this.length < e || this.length < r)
                    throw new RangeError("Out of range index"); if (r <= e)
                    return this; var o; if (e >>>= 0, r = void 0 === r ? this.length : r >>> 0, t || (t = 0), "number" == typeof t)
                    for (o = e; o < r; ++o)
                        this[o] = t;
                else {
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                    var s = a.isBuffer(t) ? t : k(new a(t, n).toString()), u = s.length;
                    for (o = 0; o < r - e; ++o)
                        this[o + e] = s[o % u];
                } return this; };
                var D = /[^+\/0-9A-Za-z-_]/g;
                function N(t: any) { return t < 16 ? "0" + t.toString(16) : t.toString(16); }
                function k(t: any, e: any) { var r; e = e || 1 / 0; for (var n = t.length, i = null, o = [], s = 0; s < n; ++s) {
                    if ((r = t.charCodeAt(s)) > 55295 && r < 57344) {
                        if (!i) {
                            if (r > 56319) {
                                (e -= 3) > -1 && o.push(239, 191, 189);
                                continue;
                            }
                            if (s + 1 === n) {
                                (e -= 3) > -1 && o.push(239, 191, 189);
                                continue;
                            }
                            i = r;
                            continue;
                        }
                        if (r < 56320) {
                            (e -= 3) > -1 && o.push(239, 191, 189), i = r;
                            continue;
                        }
                        r = 65536 + (i - 55296 << 10 | r - 56320);
                    }
                    else
                        i && (e -= 3) > -1 && o.push(239, 191, 189);
                    if (i = null, r < 128) {
                        if ((e -= 1) < 0)
                            break;
                        o.push(r);
                    }
                    else if (r < 2048) {
                        if ((e -= 2) < 0)
                            break;
                        o.push(r >> 6 | 192, 63 & r | 128);
                    }
                    else if (r < 65536) {
                        if ((e -= 3) < 0)
                            break;
                        o.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128);
                    }
                    else {
                        if (!(r < 1114112))
                            throw new Error("Invalid code point");
                        if ((e -= 4) < 0)
                            break;
                        o.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128);
                    }
                } return o; }
                function j(t: any) { return n.toByteArray(function (t) { if ((t = function (t) { return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, ""); }(t).replace(D, "")).length < 2)
                    return ""; for (; t.length % 4 != 0;)
                    t += "="; return t; }(t)); }
                function z(t: any, e: any, r: any, n: any) { for (var i = 0; i < n && !(i + r >= e.length || i >= t.length); ++i)
                    e[i + r] = t[i]; return i; }
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            }).call(this, r(8));
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        }, function (t: any, e: any) { var r; r = function () { return this; }(); try {
            r = r || Function("return this")() || (0, eval)("this");
        }
        catch (t) {
            "object" == typeof window && (r = window);
        } t.exports = r; }, function (t: any, e: any, r: any) {
            "use strict";
            e.byteLength = function (t: any) { var e = f(t), r = e[0], n = e[1]; return 3 * (r + n) / 4 - n; }, e.toByteArray = function (t: any) { for (var e, r = f(t), n = r[0], s = r[1], u = new o(function (t, e, r) { return 3 * (e + r) / 4 - r; }(0, n, s)), a = 0, h = s > 0 ? n - 4 : n, l = 0; l < h; l += 4)
                e = i[t.charCodeAt(l)] << 18 | i[t.charCodeAt(l + 1)] << 12 | i[t.charCodeAt(l + 2)] << 6 | i[t.charCodeAt(l + 3)], u[a++] = e >> 16 & 255, u[a++] = e >> 8 & 255, u[a++] = 255 & e; 2 === s && (e = i[t.charCodeAt(l)] << 2 | i[t.charCodeAt(l + 1)] >> 4, u[a++] = 255 & e); 1 === s && (e = i[t.charCodeAt(l)] << 10 | i[t.charCodeAt(l + 1)] << 4 | i[t.charCodeAt(l + 2)] >> 2, u[a++] = e >> 8 & 255, u[a++] = 255 & e); return u; }, e.fromByteArray = function (t: any) { for (var e, r = t.length, i = r % 3, o = [], s = 0, u = r - i; s < u; s += 16383)
                o.push(l(t, s, s + 16383 > u ? u : s + 16383)); 1 === i ? (e = t[r - 1], o.push(n[e >> 2] + n[e << 4 & 63] + "==")) : 2 === i && (e = (t[r - 2] << 8) + t[r - 1], o.push(n[e >> 10] + n[e >> 4 & 63] + n[e << 2 & 63] + "=")); return o.join(""); };
            for (var n: any = [], i: any = [], o = "undefined" != typeof Uint8Array ? Uint8Array : Array, s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", u = 0, a = s.length; u < a; ++u)
                n[u] = s[u], i[s.charCodeAt(u)] = u;
            function f(t: any) { var e = t.length; if (e % 4 > 0)
                throw new Error("Invalid string. Length must be a multiple of 4"); var r = t.indexOf("="); return -1 === r && (r = e), [r, r === e ? 0 : 4 - r % 4]; }
            function h(t: any) { return n[t >> 18 & 63] + n[t >> 12 & 63] + n[t >> 6 & 63] + n[63 & t]; }
            function l(t: any, e: any, r: any) { for (var n, i = [], o = e; o < r; o += 3)
                n = (t[o] << 16 & 16711680) + (t[o + 1] << 8 & 65280) + (255 & t[o + 2]), i.push(h(n)); return i.join(""); }
            i["-".charCodeAt(0)] = 62, i["_".charCodeAt(0)] = 63;
        }, function (t: any, e: any) { e.read = function (t: any, e: any, r: any, n: any, i: any) { var o, s, u = 8 * i - n - 1, a = (1 << u) - 1, f = a >> 1, h = -7, l = r ? i - 1 : 0, c = r ? -1 : 1, p = t[e + l]; for (l += c, o = p & (1 << -h) - 1, p >>= -h, h += u; h > 0; o = 256 * o + t[e + l], l += c, h -= 8)
            ; for (s = o & (1 << -h) - 1, o >>= -h, h += n; h > 0; s = 256 * s + t[e + l], l += c, h -= 8)
            ; if (0 === o)
            o = 1 - f;
        else {
            if (o === a)
                return s ? NaN : 1 / 0 * (p ? -1 : 1);
            s += Math.pow(2, n), o -= f;
        } return (p ? -1 : 1) * s * Math.pow(2, o - n); }, e.write = function (t: any, e: any, r: any, n: any, i: any, o: any) { var s, u, a, f = 8 * o - i - 1, h = (1 << f) - 1, l = h >> 1, c = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0, p = n ? 0 : o - 1, g = n ? 1 : -1, d = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0; for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, s = h) : (s = Math.floor(Math.log(e) / Math.LN2), e * (a = Math.pow(2, -s)) < 1 && (s--, a *= 2), (e += s + l >= 1 ? c / a : c * Math.pow(2, 1 - l)) * a >= 2 && (s++, a /= 2), s + l >= h ? (u = 0, s = h) : s + l >= 1 ? (u = (e * a - 1) * Math.pow(2, i), s += l) : (u = e * Math.pow(2, l - 1) * Math.pow(2, i), s = 0)); i >= 8; t[r + p] = 255 & u, p += g, u /= 256, i -= 8)
            ; for (s = s << i | u, f += i; f > 0; t[r + p] = 255 & s, p += g, s /= 256, f -= 8)
            ; t[r + p - g] |= 128 * d; }; }, function (t: any, e: any) { var r = {}.toString; t.exports = Array.isArray || function (t: any) { return "[object Array]" == r.call(t); }; }, function (e: any, r: any) { e.exports = t; }, function (t: any, e: any, r: any) { (function (t: any) { function r(t: any, e: any) { for (var r = 0, n = t.length - 1; n >= 0; n--) {
            var i = t[n];
            "." === i ? t.splice(n, 1) : ".." === i ? (t.splice(n, 1), r++) : r && (t.splice(n, 1), r--);
        } if (e)
            for (; r--; r)
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                t.unshift(".."); return t; } var n = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/, i = function (t: any) { return n.exec(t).slice(1); }; function o(t: any, e: any) { if (t.filter)
            return t.filter(e); for (var r = [], n = 0; n < t.length; n++)
            e(t[n], n, t) && r.push(t[n]); return r; } e.resolve = function () { for (var e = "", n = !1, i = arguments.length - 1; i >= -1 && !n; i--) {
            var s = i >= 0 ? arguments[i] : t.cwd();
            if ("string" != typeof s)
                throw new TypeError("Arguments to path.resolve must be strings");
            s && (e = s + "/" + e, n = "/" === s.charAt(0));
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        } return e = r(o(e.split("/"), function (t: any) { return !!t; }), !n).join("/"), (n ? "/" : "") + e || "."; }, e.normalize = function (t: any) { var n = e.isAbsolute(t), i = "/" === s(t, -1); return (t = r(o(t.split("/"), function (t: any) { return !!t; }), !n).join("/")) || n || (t = "."), t && i && (t += "/"), (n ? "/" : "") + t; }, e.isAbsolute = function (t: any) { return "/" === t.charAt(0); }, e.join = function () { var t = Array.prototype.slice.call(arguments, 0); return e.normalize(o(t, function (t: any, e: any) { if ("string" != typeof t)
            throw new TypeError("Arguments to path.join must be strings"); return t; }).join("/")); }, e.relative = function (t: any, r: any) { function n(t: any) { for (var e = 0; e < t.length && "" === t[e]; e++)
            ; for (var r = t.length - 1; r >= 0 && "" === t[r]; r--)
            ; return e > r ? [] : t.slice(e, r - e + 1); } t = e.resolve(t).substr(1), r = e.resolve(r).substr(1); for (var i = n(t.split("/")), o = n(r.split("/")), s = Math.min(i.length, o.length), u = s, a = 0; a < s; a++)
            if (i[a] !== o[a]) {
                u = a;
                break;
            } var f = []; for (a = u; a < i.length; a++)
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            f.push(".."); return (f = f.concat(o.slice(u))).join("/"); }, e.sep = "/", e.delimiter = ":", e.dirname = function (t: any) { var e = i(t), r = e[0], n = e[1]; return r || n ? (n && (n = n.substr(0, n.length - 1)), r + n) : "."; }, e.basename = function (t: any, e: any) { var r = i(t)[2]; return e && r.substr(-1 * e.length) === e && (r = r.substr(0, r.length - e.length)), r; }, e.extname = function (t: any) { return i(t)[3]; }; var s = "b" === "ab".substr(-1) ? function (t: any, e: any, r: any) { return t.substr(e, r); } : function (t: any, e: any, r: any) { return e < 0 && (e = t.length + e), t.substr(e, r); }; }).call(this, r(14)); }, function (t: any, e: any) { var r: any, n: any, i = t.exports = {}; function o() { throw new Error("setTimeout has not been defined"); } function s() { throw new Error("clearTimeout has not been defined"); } function u(t: any) { if (r === setTimeout)
            return setTimeout(t, 0); if ((r === o || !r) && setTimeout)
            return r = setTimeout, setTimeout(t, 0); try {
            return r(t, 0);
        }
        catch (e) {
            try {
                return r.call(null, t, 0);
            }
            catch (e) {
                // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                return r.call(this, t, 0);
            }
        // @ts-expect-error ts-migrate(1345) FIXME: An expression of type 'void' cannot be tested for ... Remove this comment to see the full error message
        } } !function () { try {
            r = "function" == typeof setTimeout ? setTimeout : o;
        }
        catch (t) {
            r = o;
        } try {
            n = "function" == typeof clearTimeout ? clearTimeout : s;
        }
        catch (t) {
            n = s;
        } }(); var a: any, f: any = [], h = !1, l = -1; function c() { h && a && (h = !1, a.length ? f = a.concat(f) : l = -1, f.length && p()); } function p() { if (!h) {
            var t = u(c);
            h = !0;
            for (var e = f.length; e;) {
                for (a = f, f = []; ++l < e;)
                    a && a[l].run();
                l = -1, e = f.length;
            }
            a = null, h = !1, function (t) { if (n === clearTimeout)
                return clearTimeout(t); if ((n === s || !n) && clearTimeout)
                return n = clearTimeout, clearTimeout(t); try {
                n(t);
            }
            catch (e) {
                try {
                    return n.call(null, t);
                }
                catch (e) {
                    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                    return n.call(this, t);
                }
            } }(t);
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        } } function g(t: any, e: any) { this.fun = t, this.array = e; } function d() { } (i as any).nextTick = function (t: any) { var e = new Array(arguments.length - 1); if (arguments.length > 1)
            for (var r = 1; r < arguments.length; r++)
                // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
                e[r - 1] = arguments[r]; f.push(new g(t, e)), 1 !== f.length || h || u(p); }, g.prototype.run = function () { this.fun.apply(null, this.array); }, (i as any).title = "browser", (i as any).browser = !0, (i as any).env = {}, (i as any).argv = [], (i as any).version = "", (i as any).versions = {}, (i as any).on = d, (i as any).addListener = d, (i as any).once = d, (i as any).off = d, (i as any).removeListener = d, (i as any).removeAllListeners = d, (i as any).emit = d, (i as any).prependListener = d, (i as any).prependOnceListener = d, (i as any).listeners = function (t: any) { return []; }, (i as any).binding = function (t: any) { throw new Error("process.binding is not supported"); }, (i as any).cwd = function () { return "/"; }, (i as any).chdir = function (t: any) { throw new Error("process.chdir is not supported"); }, (i as any).umask = function () { return 0; }; }]);
});
//-------------------------------------------------------------
const unpackBridge = (WorkerScope as any).unpackBridge;
let unpack: any;
//-------------------------unpack--------------------------
var initunpack = function (wasmBinaryFile: any) {
    // The following code has been _carefully_ modified by hand.
    // Due to WebPack embedding this script into the Zea engine
    // build, certain features broke.
    // There was code to handle loading in a nodeJS context, that tried to import("fs")
    // WebPack kepts tripping up on that code in its static analysis of the code, so
    // I carefully removed it.
    // The global scope of the script seems to be different, so unpackBridge was not available.
    // The unpackBridge code assigns unpackBridge to the passed in scope, which is 'this', but that
    // scope isn't available inside this 'unpack' function.
    const unpack = {};
    // Note: the following is the URL of the unpack.wasm file in our ZeaEngine project on our
    // server. Ideally we could use a relative path from the ZeaEngine file, but
    // that isn't possible yet. (TODO: Ask Mauro about this)
    const credentials = "omit";
    // var wasmBinaryFile="unpack.wasm";
    var Module = typeof unpack !== "undefined" ? unpack : {};
    var Ext = unpackBridge.Ext;
    var jsAPI = { open: (function () { return Ext.current.open.apply(Ext.current, arguments); }), close: (function () { return Ext.current.close.apply(Ext.current, arguments); }), read: (function () { return Ext.current.read.apply(Ext.current, arguments); }), write: (function () { return Ext.current.write.apply(Ext.current, arguments); }), tell: (function () { return Ext.current.tell.apply(Ext.current, arguments); }), seek: (function () { return Ext.current.seek.apply(Ext.current, arguments); }), create: (function () { return Ext.current.create.apply(Ext.current, arguments); }) };
    var moduleOverrides = {};
    var key;
    for (key in Module) {
        if (Module.hasOwnProperty(key)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            moduleOverrides[key] = Module[key];
        }
    }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["arguments"] = [];
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["thisProgram"] = "./this.program";
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["quit"] = (function (status: any, toThrow: any) { throw toThrow; });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["preRun"] = [];
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["postRun"] = [];
    var ENVIRONMENT_IS_WEB = false;
    var ENVIRONMENT_IS_WORKER = false;
    var ENVIRONMENT_IS_NODE = false;
    var ENVIRONMENT_IS_SHELL = false;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (Module["ENVIRONMENT"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (Module["ENVIRONMENT"] === "WEB") {
            ENVIRONMENT_IS_WEB = true;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        else if (Module["ENVIRONMENT"] === "WORKER") {
            ENVIRONMENT_IS_WORKER = true;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        else if (Module["ENVIRONMENT"] === "NODE") {
            ENVIRONMENT_IS_NODE = true;
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        else if (Module["ENVIRONMENT"] === "SHELL") {
            ENVIRONMENT_IS_SHELL = true;
        }
        else {
            throw new Error("Module['ENVIRONMENT'] value is not valid. must be one of: WEB|WORKER|NODE|SHELL.");
        }
    }
    else {
        ENVIRONMENT_IS_WEB = typeof window === "object";
        ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
        ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
        ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
    }
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["read"] = function shell_read(url: any) { var xhr = new XMLHttpRequest; xhr.open("GET", url, false); xhr.send(null); return xhr.responseText; };
        if (ENVIRONMENT_IS_WORKER) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module["readBinary"] = function readBinary(url: any) { var xhr = new XMLHttpRequest; xhr.open("GET", url, false); xhr.responseType = "arraybuffer"; xhr.send(null); return new Uint8Array(xhr.response); };
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["readAsync"] = function readAsync(url: any, onload: any, onerror: any) { var xhr = new XMLHttpRequest; xhr.open("GET", url, true); xhr.responseType = "arraybuffer"; xhr.onload = function xhr_onload() { if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
            onload(xhr.response);
            return;
        } onerror(); }; xhr.onerror = onerror; xhr.send(null); };
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setWindowTitle"] = (function (title: any) { document.title = title; });
    }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["print"] = typeof console !== "undefined" ? console.log.bind(console) : typeof print !== "undefined" ? print : null;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["printErr"] = typeof printErr !== "undefined" ? printErr : typeof console !== "undefined" && console.warn.bind(console) || Module["print"];
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    (Module as any).print = Module["print"];
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    (Module as any).printErr = Module["printErr"];
    for (key in moduleOverrides) {
        if (moduleOverrides.hasOwnProperty(key)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module[key] = moduleOverrides[key];
        }
    }
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'undefined' is not assignable to type '{}'.
    moduleOverrides = undefined;
    var STACK_ALIGN = 16;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    function staticAlloc(size: any) { assert(!staticSealed); var ret = STATICTOP; STATICTOP = STATICTOP + size + 15 & -16; return ret; }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    function dynamicAlloc(size: any) { assert(DYNAMICTOP_PTR); var ret = HEAP32[DYNAMICTOP_PTR >> 2]; var end = ret + size + 15 & -16; HEAP32[DYNAMICTOP_PTR >> 2] = end; if (end >= TOTAL_MEMORY) {
        var success = enlargeMemory();
        if (!success) {
            HEAP32[DYNAMICTOP_PTR >> 2] = ret;
            return 0;
        }
    } return ret; }
    function alignMemory(size: any, factor: any) { if (!factor)
        factor = STACK_ALIGN; var ret = size = Math.ceil(size / factor) * factor; return ret; }
    function getNativeTypeSize(type: any) { switch (type) {
        case "i1":
        case "i8": return 1;
        case "i16": return 2;
        case "i32": return 4;
        case "i64": return 8;
        case "float": return 4;
        case "double": return 8;
        default: {
            if (type[type.length - 1] === "*") {
                return 4;
            }
            else if (type[0] === "i") {
                var bits = parseInt(type.substr(1));
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                assert(bits % 8 === 0);
                return bits / 8;
            }
            else {
                return 0;
            }
        }
    } }
    var functionPointers = new Array(0);
    var GLOBAL_BASE = 1024;
    var ABORT = 0;
    var EXITSTATUS = 0;
    function assert(condition: any, text: any) { if (!condition) {
        abort("Assertion failed: " + text);
    } }
    function setValue(ptr: any, value: any, type: any, noSafe: any) { type = type || "i8"; if (type.charAt(type.length - 1) === "*")
        type = "i32"; switch (type) {
        case "i1":
            HEAP8[ptr >> 0] = value;
            break;
        case "i8":
            HEAP8[ptr >> 0] = value;
            break;
        case "i16":
            HEAP16[ptr >> 1] = value;
            break;
        case "i32":
            HEAP32[ptr >> 2] = value;
            break;
        case "i64":
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'tempI64'.
            tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
            break;
        case "float":
            HEAPF32[ptr >> 2] = value;
            break;
        case "double":
            HEAPF64[ptr >> 3] = value;
            break;
        default: abort("invalid type for setValue: " + type);
    } }
    var ALLOC_NORMAL = 0;
    var ALLOC_STATIC = 2;
    var ALLOC_NONE = 4;
    function allocate(slab: any, types: any, allocator: any, ptr: any) { var zeroinit, size; if (typeof slab === "number") {
        zeroinit = true;
        size = slab;
    }
    else {
        zeroinit = false;
        size = slab.length;
    } var singleType = typeof types === "string" ? types : null; var ret; if (allocator == ALLOC_NONE) {
        ret = ptr;
    }
    else {
        ret = [typeof _malloc === "function" ? _malloc : staticAlloc, stackAlloc, staticAlloc, dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
    } if (zeroinit) {
        var stop;
        ptr = ret;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        assert((ret & 3) == 0);
        stop = ret + (size & ~3);
        for (; ptr < stop; ptr += 4) {
            HEAP32[ptr >> 2] = 0;
        }
        stop = ret + size;
        while (ptr < stop) {
            HEAP8[ptr++ >> 0] = 0;
        }
        return ret;
    } if (singleType === "i8") {
        if (slab.subarray || slab.slice) {
            HEAPU8.set(slab, ret);
        }
        else {
            HEAPU8.set(new Uint8Array(slab), ret);
        }
        return ret;
    } var i = 0, type, typeSize, previousType; while (i < size) {
        var curr = slab[i];
        type = singleType || types[i];
        if (type === 0) {
            i++;
            continue;
        }
        if (type == "i64")
            type = "i32";
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        setValue(ret + i, curr, type);
        if (previousType !== type) {
            typeSize = getNativeTypeSize(type);
            previousType = type;
        }
        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
        i += typeSize;
    } return ret; }
    function Pointer_stringify(ptr: any, length: any) { if (length === 0 || !ptr)
        return ""; var hasUtf = 0; var t; var i = 0; while (1) {
        t = HEAPU8[ptr + i >> 0];
        hasUtf |= t;
        if (t == 0 && !length)
            break;
        i++;
        if (length && i == length)
            break;
    } if (!length)
        length = i; var ret = ""; if (hasUtf < 128) {
        var MAX_CHUNK = 1024;
        var curr;
        while (length > 0) {
            curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
            ret = ret ? ret + curr : curr;
            ptr += MAX_CHUNK;
            length -= MAX_CHUNK;
        }
        return ret;
    } return UTF8ToString(ptr); }
    var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
    function UTF8ArrayToString(u8Array: any, idx: any) { var endPtr = idx; while (u8Array[endPtr])
        ++endPtr; if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
    }
    else {
        var u0, u1, u2, u3, u4, u5;
        var str = "";
        while (1) {
            u0 = u8Array[idx++];
            if (!u0)
                return str;
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue;
            }
            u1 = u8Array[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue;
            }
            u2 = u8Array[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            }
            else {
                u3 = u8Array[idx++] & 63;
                if ((u0 & 248) == 240) {
                    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
                }
                else {
                    u4 = u8Array[idx++] & 63;
                    if ((u0 & 252) == 248) {
                        u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
                    }
                    else {
                        u5 = u8Array[idx++] & 63;
                        u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
                    }
                }
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0);
            }
            else {
                var ch = u0 - 65536;
                str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
        }
    } }
    function UTF8ToString(ptr: any) { return UTF8ArrayToString(HEAPU8, ptr); }
    function stringToUTF8Array(str: any, outU8Array: any, outIdx: any, maxBytesToWrite: any) { if (!(maxBytesToWrite > 0))
        return 0; var startIdx = outIdx; var endIdx = outIdx + maxBytesToWrite - 1; for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343)
            u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127) {
            if (outIdx >= endIdx)
                break;
            outU8Array[outIdx++] = u;
        }
        else if (u <= 2047) {
            if (outIdx + 1 >= endIdx)
                break;
            outU8Array[outIdx++] = 192 | u >> 6;
            outU8Array[outIdx++] = 128 | u & 63;
        }
        else if (u <= 65535) {
            if (outIdx + 2 >= endIdx)
                break;
            outU8Array[outIdx++] = 224 | u >> 12;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63;
        }
        else if (u <= 2097151) {
            if (outIdx + 3 >= endIdx)
                break;
            outU8Array[outIdx++] = 240 | u >> 18;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63;
        }
        else if (u <= 67108863) {
            if (outIdx + 4 >= endIdx)
                break;
            outU8Array[outIdx++] = 248 | u >> 24;
            outU8Array[outIdx++] = 128 | u >> 18 & 63;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63;
        }
        else {
            if (outIdx + 5 >= endIdx)
                break;
            outU8Array[outIdx++] = 252 | u >> 30;
            outU8Array[outIdx++] = 128 | u >> 24 & 63;
            outU8Array[outIdx++] = 128 | u >> 18 & 63;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63;
        }
    } outU8Array[outIdx] = 0; return outIdx - startIdx; }
    function stringToUTF8(str: any, outPtr: any, maxBytesToWrite: any) { return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite); }
    function lengthBytesUTF8(str: any) { var len = 0; for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343)
            u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127) {
            ++len;
        }
        else if (u <= 2047) {
            len += 2;
        }
        else if (u <= 65535) {
            len += 3;
        }
        else if (u <= 2097151) {
            len += 4;
        }
        else if (u <= 67108863) {
            len += 5;
        }
        else {
            len += 6;
        }
    } return len; }
    var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
    function UTF32ToString(ptr: any) { var i = 0; var str = ""; while (1) {
        var utf32 = HEAP32[ptr + i * 4 >> 2];
        if (utf32 == 0)
            return str;
        ++i;
        if (utf32 >= 65536) {
            var ch = utf32 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        }
        else {
            str += String.fromCharCode(utf32);
        }
    } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    function allocateUTF8(str: any) { var size = lengthBytesUTF8(str) + 1; var ret = _malloc(size); if (ret)
        stringToUTF8Array(str, HEAP8, ret, size); return ret; }
    function demangle(func: any) { return func; }
    function demangleAll(text: any) { var regex = /__Z[\w\d_]+/g; return text.replace(regex, (function (x: any) { var y = demangle(x); return x === y ? x : x + " [" + y + "]"; })); }
    function jsStackTrace() { var err = new Error; if (!err.stack) {
        try {
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '0' is not assignable to paramete... Remove this comment to see the full error message
            throw new Error(0);
        }
        catch (e) {
            err = e;
        }
        if (!err.stack) {
            return "(no stack trace available)";
        }
    } return err.stack.toString(); }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function stackTrace() { var js = jsStackTrace(); if (Module["extraStackTrace"])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        js += "\n" + Module["extraStackTrace"](); return demangleAll(js); }
    var WASM_PAGE_SIZE = 65536;
    var ASMJS_PAGE_SIZE = 16777216;
    var MIN_TOTAL_MEMORY = 16777216;
    function alignUp(x: any, multiple: any) { if (x % multiple > 0) {
        x += multiple - x % multiple;
    } return x; }
    var buffer: any, HEAP8: any, HEAPU8: any, HEAP16: any, HEAPU16: any, HEAP32: any, HEAPU32: any, HEAPF32: any, HEAPF64: any;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function updateGlobalBuffer(buf: any) { Module["buffer"] = buffer = buf; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function updateGlobalBufferViews() { Module["HEAP8"] = HEAP8 = new Int8Array(buffer); Module["HEAP16"] = HEAP16 = new Int16Array(buffer); Module["HEAP32"] = HEAP32 = new Int32Array(buffer); Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer); Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer); Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer); Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer); Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer); }
    var STATIC_BASE, STATICTOP: any, staticSealed: any;
    var STACK_BASE, STACKTOP, STACK_MAX;
    var DYNAMIC_BASE, DYNAMICTOP_PTR: any;
    STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
    staticSealed = false;
    function abortOnCannotGrowMemory() { abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 "); }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (!Module["reallocBuffer"])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["reallocBuffer"] = (function (size: any) { var ret; try {
            if ((ArrayBuffer as any).transfer) {
                ret = (ArrayBuffer as any).transfer(buffer, size);
            }
            else {
                var oldHEAP8 = HEAP8;
                ret = new ArrayBuffer(size);
                var temp = new Int8Array(ret);
                temp.set(oldHEAP8);
            }
        }
        catch (e) {
            return false;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        } var success = _emscripten_replace_memory(ret); if (!success)
            return false; return ret; });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function enlargeMemory() { var PAGE_MULTIPLE = Module["usingWasm"] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE; var LIMIT = 2147483648 - PAGE_MULTIPLE; if (HEAP32[DYNAMICTOP_PTR >> 2] > LIMIT) {
        return false;
    } var OLD_TOTAL_MEMORY = TOTAL_MEMORY; TOTAL_MEMORY = Math.max(TOTAL_MEMORY, MIN_TOTAL_MEMORY); while (TOTAL_MEMORY < HEAP32[DYNAMICTOP_PTR >> 2]) {
        if (TOTAL_MEMORY <= 536870912) {
            TOTAL_MEMORY = alignUp(2 * TOTAL_MEMORY, PAGE_MULTIPLE);
        }
        else {
            TOTAL_MEMORY = Math.min(alignUp((3 * TOTAL_MEMORY + 2147483648) / 4, PAGE_MULTIPLE), LIMIT);
        }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } var replacement = Module["reallocBuffer"](TOTAL_MEMORY); if (!replacement || replacement.byteLength != TOTAL_MEMORY) {
        TOTAL_MEMORY = OLD_TOTAL_MEMORY;
        return false;
    } updateGlobalBuffer(replacement); updateGlobalBufferViews(); return true; }
    var byteLength;
    try {
        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
        byteLength = Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get);
        byteLength(new ArrayBuffer(4));
    }
    catch (e) {
        byteLength = (function (buffer: any) { return buffer.byteLength; });
    }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
    if (TOTAL_MEMORY < TOTAL_STACK)
        (Module as any).printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (Module["buffer"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        buffer = Module["buffer"];
    }
    else {
        if (typeof WebAssembly === "object" && typeof WebAssembly.Memory === "function") {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module["wasmMemory"] = new WebAssembly.Memory({ "initial": TOTAL_MEMORY / WASM_PAGE_SIZE });
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            buffer = Module["wasmMemory"].buffer;
        }
        else {
            buffer = new ArrayBuffer(TOTAL_MEMORY);
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["buffer"] = buffer;
    }
    updateGlobalBufferViews();
    function getTotalMemory() { return TOTAL_MEMORY; }
    HEAP32[0] = 1668509029;
    HEAP16[1] = 25459;
    if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99)
        throw "Runtime error: expected the system to be little-endian!";
    function callRuntimeCallbacks(callbacks: any) { while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback();
            continue;
        }
        var func = callback.func;
        if (typeof func === "number") {
            if (callback.arg === undefined) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                Module["dynCall_v"](func);
            }
            else {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                Module["dynCall_vi"](func, callback.arg);
            }
        }
        else {
            func(callback.arg === undefined ? null : callback.arg);
        }
    } }
    var __ATPRERUN__: any = [];
    var __ATINIT__: any = [];
    var __ATMAIN__: any = [];
    var __ATEXIT__: any = [];
    var __ATPOSTRUN__: any = [];
    var runtimeInitialized = false;
    var runtimeExited = false;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function preRun() { if (Module["preRun"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (typeof Module["preRun"] == "function")
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module["preRun"] = [Module["preRun"]];
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        while (Module["preRun"].length) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            addOnPreRun(Module["preRun"].shift());
        }
    } callRuntimeCallbacks(__ATPRERUN__); }
    function ensureInitRuntime() { if (runtimeInitialized)
        return; runtimeInitialized = true; callRuntimeCallbacks(__ATINIT__); }
    function preMain() { callRuntimeCallbacks(__ATMAIN__); }
    function exitRuntime() { callRuntimeCallbacks(__ATEXIT__); runtimeExited = true; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function postRun() { if (Module["postRun"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (typeof Module["postRun"] == "function")
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module["postRun"] = [Module["postRun"]];
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        while (Module["postRun"].length) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            addOnPostRun(Module["postRun"].shift());
        }
    } callRuntimeCallbacks(__ATPOSTRUN__); }
    function addOnPreRun(cb: any) { __ATPRERUN__.unshift(cb); }
    function addOnPostRun(cb: any) { __ATPOSTRUN__.unshift(cb); }
    function writeAsciiToMemory(str: any, buffer: any, dontAddNull: any) { for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
    } if (!dontAddNull)
        HEAP8[buffer >> 0] = 0; }
    var Math_abs = Math.abs;
    var Math_cos = Math.cos;
    var Math_sin = Math.sin;
    var Math_tan = Math.tan;
    var Math_acos = Math.acos;
    var Math_asin = Math.asin;
    var Math_atan = Math.atan;
    var Math_atan2 = Math.atan2;
    var Math_exp = Math.exp;
    var Math_log = Math.log;
    var Math_sqrt = Math.sqrt;
    var Math_ceil = Math.ceil;
    var Math_floor = Math.floor;
    var Math_pow = Math.pow;
    var Math_imul = Math.imul;
    var Math_fround = Math.fround;
    var Math_round = Math.round;
    var Math_min = Math.min;
    var Math_max = Math.max;
    var Math_clz32 = Math.clz32;
    var Math_trunc = Math.trunc;
    var runDependencies = 0;
    var runDependencyWatcher: any = null;
    var dependenciesFulfilled: any = null;
    function getUniqueRunDependency(id: any) { return id; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function addRunDependency(id: any) { runDependencies++; if (Module["monitorRunDependencies"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["monitorRunDependencies"](runDependencies);
    } }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function removeRunDependency(id: any) { runDependencies--; if (Module["monitorRunDependencies"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["monitorRunDependencies"](runDependencies);
    } if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
        }
    } }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["preloadedImages"] = {};
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["preloadedAudios"] = {};
    var dataURIPrefix = "data:application/octet-stream;base64,";
    // @ts-expect-error ts-migrate(2774) FIXME: This condition will always return true since the f... Remove this comment to see the full error message
    function isDataURI(filename: any) { return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function integrateWasmJS() { var wasmTextFile = "unpack.wast"; ; var asmjsCodeFile = "unpack.temp.asm.js"; if (typeof Module["locateFile"] === "function") {
        if (!isDataURI(wasmTextFile)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            wasmTextFile = Module["locateFile"](wasmTextFile);
        }
        if (!isDataURI(wasmBinaryFile)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            wasmBinaryFile = Module["locateFile"](wasmBinaryFile);
        }
        if (!isDataURI(asmjsCodeFile)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            asmjsCodeFile = Module["locateFile"](asmjsCodeFile);
        }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } var wasmPageSize = 64 * 1024; var info = { "global": null, "env": null, "asm2wasm": { "f64-rem": (function (x: any, y: any) { return x % y; }), "debugger": (function () { debugger; }) }, "parent": Module }; var exports = null; function mergeMemory(newBuffer: any) { var oldBuffer = Module["buffer"]; if (newBuffer.byteLength < oldBuffer.byteLength) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["printErr"]("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here");
    } var oldView = new Int8Array(oldBuffer); var newView = new Int8Array(newBuffer); newView.set(oldView); updateGlobalBuffer(newBuffer); updateGlobalBufferViews(); } function fixImports(imports: any) { return imports; } function getBinary() { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (Module["wasmBinary"]) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return new Uint8Array(Module["wasmBinary"]);
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (Module["readBinary"]) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return Module["readBinary"](wasmBinaryFile);
        }
        else {
            throw "on the web, we need the wasm binary to be preloaded and set on Module['wasmBinary']. emcc.py will do that for you when generating HTML (but not JS)";
        }
    }
    catch (err) {
        abort(err);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } } function getBinaryPromise() { if (!Module["wasmBinary"] && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
        return fetch(wasmBinaryFile, { credentials }).then((function (response) { if (!response["ok"]) {
            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        } return response["arrayBuffer"](); })).catch((function () { return getBinary(); }));
    } return new Promise((function (resolve, reject) { resolve(getBinary()); })); } function doNativeWasm(global: any, env: any, providedBuffer: any) { if (typeof WebAssembly !== "object") {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["printErr"]("no native wasm support detected");
        return false;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } if (!(Module["wasmMemory"] instanceof WebAssembly.Memory)) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["printErr"]("no native wasm Memory in use");
        return false;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } env["memory"] = Module["wasmMemory"]; info["global"] = { "NaN": NaN, "Infinity": Infinity }; info["global.Math"] = Math; info["env"] = env; function receiveInstance(instance: any, module: any) { exports = instance.exports; if (exports.memory)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        mergeMemory(exports.memory); Module["asm"] = exports; Module["usingWasm"] = true; removeRunDependency("wasm-instantiate"); } addRunDependency("wasm-instantiate"); if (Module["instantiateWasm"]) {
        try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return Module["instantiateWasm"](info, receiveInstance);
        }
        catch (e) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module["printErr"]("Module.instantiateWasm callback failed with error: " + e);
            return false;
        }
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    } function receiveInstantiatedSource(output: any) { receiveInstance(output["instance"], output["module"]); } function instantiateArrayBuffer(receiver: any) { getBinaryPromise().then((function (binary) { return WebAssembly.instantiate(binary, info); })).then(receiver).catch((function (reason) { Module["printErr"]("failed to asynchronously prepare wasm: " + reason); abort(reason); })); } if (!Module["wasmBinary"] && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ global: null; env: null; asm2w... Remove this comment to see the full error message
        WebAssembly.instantiateStreaming(fetch(wasmBinaryFile, { credentials }), info).then(receiveInstantiatedSource).catch((function (reason) { Module["printErr"]("wasm streaming compile failed: " + reason); Module["printErr"]("falling back to ArrayBuffer instantiation"); instantiateArrayBuffer(receiveInstantiatedSource); }));
    }
    else {
        instantiateArrayBuffer(receiveInstantiatedSource);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } return {}; } Module["asmPreload"] = Module["asm"]; var asmjsReallocBuffer = Module["reallocBuffer"]; var wasmReallocBuffer = (function (size: any) { var PAGE_MULTIPLE = Module["usingWasm"] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE; size = alignUp(size, PAGE_MULTIPLE); var old = Module["buffer"]; var oldSize = old.byteLength; if (Module["usingWasm"]) {
        try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            var result = Module["wasmMemory"].grow((size - oldSize) / wasmPageSize);
            if (result !== (-1 | 0)) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                return Module["buffer"] = Module["wasmMemory"].buffer;
            }
            else {
                return null;
            }
        }
        catch (e) {
            return null;
        }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } }); Module["reallocBuffer"] = (function (size: any) { if (finalMethod === "asmjs") {
        return asmjsReallocBuffer(size);
    }
    else {
        return wasmReallocBuffer(size);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } }); var finalMethod = ""; Module["asm"] = (function (global: any, env: any, providedBuffer: any) { env = fixImports(env); if (!env["table"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var TABLE_SIZE = Module["wasmTableSize"];
        if (TABLE_SIZE === undefined)
            TABLE_SIZE = 1024;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var MAX_TABLE_SIZE = Module["wasmMaxTableSize"];
        if (typeof WebAssembly === "object" && typeof WebAssembly.Table === "function") {
            if (MAX_TABLE_SIZE !== undefined) {
                env["table"] = new WebAssembly.Table({ "initial": TABLE_SIZE, "maximum": MAX_TABLE_SIZE, "element": "anyfunc" });
            }
            else {
                env["table"] = new WebAssembly.Table({ "initial": TABLE_SIZE, element: "anyfunc" });
            }
        }
        else {
            env["table"] = new Array(TABLE_SIZE);
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["wasmTable"] = env["table"];
    } if (!env["memoryBase"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        env["memoryBase"] = Module["STATIC_BASE"];
    } if (!env["tableBase"]) {
        env["tableBase"] = 0;
    } var exports; exports = doNativeWasm(global, env, providedBuffer); if (!exports)
        abort("no binaryen method succeeded. consider enabling more options, like interpreting, if you want that: https://github.com/kripken/emscripten/wiki/WebAssembly#binaryen-methods"); return exports; }); }
    integrateWasmJS();
    STATIC_BASE = GLOBAL_BASE;
    STATICTOP = STATIC_BASE + 66960;
    __ATINIT__.push({ func: (function () { __GLOBAL__sub_I_global_cpp(); }) }, { func: (function () { __GLOBAL__sub_I_crc_cpp(); }) }, { func: (function () { __GLOBAL__sub_I_bridge_cpp(); }) }, { func: (function () { __GLOBAL__sub_I_bind_cpp(); }) });
    var STATIC_BUMP = 66960;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["STATIC_BASE"] = STATIC_BASE;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["STATIC_BUMP"] = STATIC_BUMP;
    STATICTOP += 16;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    function ___cxa_allocate_exception(size: any) { return _malloc(size); }
    function __ZSt18uncaught_exceptionv() { return !!(__ZSt18uncaught_exceptionv as any).uncaught_exception; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var EXCEPTIONS = { last: 0, caught: [], infos: {}, deAdjust: (function (adjusted: any) { if (!adjusted || EXCEPTIONS.infos[adjusted])
            return adjusted; for (var key in EXCEPTIONS.infos) {
            var ptr = +key;
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            var info = EXCEPTIONS.infos[ptr];
            if (info.adjusted === adjusted) {
                return ptr;
            }
        } return adjusted; }), addRef: (function (ptr: any) { if (!ptr)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return; var info = EXCEPTIONS.infos[ptr]; info.refcount++; }), decRef: (function (ptr: any) { if (!ptr)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return; var info = EXCEPTIONS.infos[ptr]; assert(info.refcount > 0); info.refcount--; if (info.refcount === 0 && !info.rethrown) {
            if (info.destructor) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                Module["dynCall_vi"](info.destructor, ptr);
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            delete EXCEPTIONS.infos[ptr];
            ___cxa_free_exception(ptr);
        } }), clearRef: (function (ptr: any) { if (!ptr)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return; var info = EXCEPTIONS.infos[ptr]; info.refcount = 0; }) };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function ___cxa_begin_catch(ptr: any) { var info = EXCEPTIONS.infos[ptr]; if (info && !info.caught) {
        info.caught = true;
        (__ZSt18uncaught_exceptionv as any).uncaught_exception--;
    } if (info)
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
        info.rethrown = false; EXCEPTIONS.caught.push(ptr); EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr)); return ptr; }
    function ___cxa_free_exception(ptr: any) { try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        return _free(ptr);
    }
    catch (e) { } }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function ___cxa_end_catch() { Module["setThrew"](0); var ptr = EXCEPTIONS.caught.pop(); if (ptr) {
        EXCEPTIONS.decRef(EXCEPTIONS.deAdjust(ptr));
        EXCEPTIONS.last = 0;
    } }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
    function ___cxa_find_matching_catch_2() { return ___cxa_find_matching_catch.apply(null, arguments); }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
    function ___cxa_find_matching_catch_3() { return ___cxa_find_matching_catch.apply(null, arguments); }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
    function ___cxa_find_matching_catch_4() { return ___cxa_find_matching_catch.apply(null, arguments); }
    function ___resumeException(ptr: any) { if (!EXCEPTIONS.last) {
        EXCEPTIONS.last = ptr;
    } throw ptr; }
    function ___cxa_find_matching_catch() { var thrown = EXCEPTIONS.last; if (!thrown) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        return (setTempRet0(0), 0) | 0;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } var info = EXCEPTIONS.infos[thrown]; var throwntype = info.type; if (!throwntype) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        return (setTempRet0(0), thrown) | 0;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } var typeArray = Array.prototype.slice.call(arguments); var pointer = Module["___cxa_is_pointer_type"](throwntype); if (!(___cxa_find_matching_catch as any).buffer)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        (___cxa_find_matching_catch as any).buffer = _malloc(4); HEAP32[(___cxa_find_matching_catch as any).buffer >> 2] = thrown; thrown = (___cxa_find_matching_catch as any).buffer; for (var i = 0; i < typeArray.length; i++) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (typeArray[i] && Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)) {
            thrown = HEAP32[thrown >> 2];
            info.adjusted = thrown;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
            return (setTempRet0(typeArray[i]), thrown) | 0;
        }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    } thrown = HEAP32[thrown >> 2]; return (setTempRet0(throwntype), thrown) | 0; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function ___cxa_throw(ptr: any, type: any, destructor: any) { EXCEPTIONS.infos[ptr] = { ptr: ptr, adjusted: ptr, type: type, destructor: destructor, refcount: 0, caught: false, rethrown: false }; EXCEPTIONS.last = ptr; if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        (__ZSt18uncaught_exceptionv as any).uncaught_exception = 1;
    }
    else {
        (__ZSt18uncaught_exceptionv as any).uncaught_exception++;
    } throw ptr; }
    function ___lock() { }
    var ERRNO_CODES = { EPERM: 1, ENOENT: 2, ESRCH: 3, EINTR: 4, EIO: 5, ENXIO: 6, E2BIG: 7, ENOEXEC: 8, EBADF: 9, ECHILD: 10, EAGAIN: 11, EWOULDBLOCK: 11, ENOMEM: 12, EACCES: 13, EFAULT: 14, ENOTBLK: 15, EBUSY: 16, EEXIST: 17, EXDEV: 18, ENODEV: 19, ENOTDIR: 20, EISDIR: 21, EINVAL: 22, ENFILE: 23, EMFILE: 24, ENOTTY: 25, ETXTBSY: 26, EFBIG: 27, ENOSPC: 28, ESPIPE: 29, EROFS: 30, EMLINK: 31, EPIPE: 32, EDOM: 33, ERANGE: 34, ENOMSG: 42, EIDRM: 43, ECHRNG: 44, EL2NSYNC: 45, EL3HLT: 46, EL3RST: 47, ELNRNG: 48, EUNATCH: 49, ENOCSI: 50, EL2HLT: 51, EDEADLK: 35, ENOLCK: 37, EBADE: 52, EBADR: 53, EXFULL: 54, ENOANO: 55, EBADRQC: 56, EBADSLT: 57, EDEADLOCK: 35, EBFONT: 59, ENOSTR: 60, ENODATA: 61, ETIME: 62, ENOSR: 63, ENONET: 64, ENOPKG: 65, EREMOTE: 66, ENOLINK: 67, EADV: 68, ESRMNT: 69, ECOMM: 70, EPROTO: 71, EMULTIHOP: 72, EDOTDOT: 73, EBADMSG: 74, ENOTUNIQ: 76, EBADFD: 77, EREMCHG: 78, ELIBACC: 79, ELIBBAD: 80, ELIBSCN: 81, ELIBMAX: 82, ELIBEXEC: 83, ENOSYS: 38, ENOTEMPTY: 39, ENAMETOOLONG: 36, ELOOP: 40, EOPNOTSUPP: 95, EPFNOSUPPORT: 96, ECONNRESET: 104, ENOBUFS: 105, EAFNOSUPPORT: 97, EPROTOTYPE: 91, ENOTSOCK: 88, ENOPROTOOPT: 92, ESHUTDOWN: 108, ECONNREFUSED: 111, EADDRINUSE: 98, ECONNABORTED: 103, ENETUNREACH: 101, ENETDOWN: 100, ETIMEDOUT: 110, EHOSTDOWN: 112, EHOSTUNREACH: 113, EINPROGRESS: 115, EALREADY: 114, EDESTADDRREQ: 89, EMSGSIZE: 90, EPROTONOSUPPORT: 93, ESOCKTNOSUPPORT: 94, EADDRNOTAVAIL: 99, ENETRESET: 102, EISCONN: 106, ENOTCONN: 107, ETOOMANYREFS: 109, EUSERS: 87, EDQUOT: 122, ESTALE: 116, ENOTSUP: 95, ENOMEDIUM: 123, EILSEQ: 84, EOVERFLOW: 75, ECANCELED: 125, ENOTRECOVERABLE: 131, EOWNERDEAD: 130, ESTRPIPE: 86 };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function ___setErrNo(value: any) { if (Module["___errno_location"])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        HEAP32[Module["___errno_location"]() >> 2] = value; return value; }
    function ___map_file(pathname: any, size: any) { ___setErrNo(ERRNO_CODES.EPERM); return -1; }
    var ERRNO_MESSAGES = { 0: "Success", 1: "Not super-user", 2: "No such file or directory", 3: "No such process", 4: "Interrupted system call", 5: "I/O error", 6: "No such device or address", 7: "Arg list too long", 8: "Exec format error", 9: "Bad file number", 10: "No children", 11: "No more processes", 12: "Not enough core", 13: "Permission denied", 14: "Bad address", 15: "Block device required", 16: "Mount device busy", 17: "File exists", 18: "Cross-device link", 19: "No such device", 20: "Not a directory", 21: "Is a directory", 22: "Invalid argument", 23: "Too many open files in system", 24: "Too many open files", 25: "Not a typewriter", 26: "Text file busy", 27: "File too large", 28: "No space left on device", 29: "Illegal seek", 30: "Read only file system", 31: "Too many links", 32: "Broken pipe", 33: "Math arg out of domain of func", 34: "Math result not representable", 35: "File locking deadlock error", 36: "File or path name too long", 37: "No record locks available", 38: "Function not implemented", 39: "Directory not empty", 40: "Too many symbolic links", 42: "No message of desired type", 43: "Identifier removed", 44: "Channel number out of range", 45: "Level 2 not synchronized", 46: "Level 3 halted", 47: "Level 3 reset", 48: "Link number out of range", 49: "Protocol driver not attached", 50: "No CSI structure available", 51: "Level 2 halted", 52: "Invalid exchange", 53: "Invalid request descriptor", 54: "Exchange full", 55: "No anode", 56: "Invalid request code", 57: "Invalid slot", 59: "Bad font file fmt", 60: "Device not a stream", 61: "No data (for no delay io)", 62: "Timer expired", 63: "Out of streams resources", 64: "Machine is not on the network", 65: "Package not installed", 66: "The object is remote", 67: "The link has been severed", 68: "Advertise error", 69: "Srmount error", 70: "Communication error on send", 71: "Protocol error", 72: "Multihop attempted", 73: "Cross mount point (not really error)", 74: "Trying to read unreadable message", 75: "Value too large for defined data type", 76: "Given log. name not unique", 77: "f.d. invalid for this operation", 78: "Remote address changed", 79: "Can   access a needed shared lib", 80: "Accessing a corrupted shared lib", 81: ".lib section in a.out corrupted", 82: "Attempting to link in too many libs", 83: "Attempting to exec a shared library", 84: "Illegal byte sequence", 86: "Streams pipe error", 87: "Too many users", 88: "Socket operation on non-socket", 89: "Destination address required", 90: "Message too long", 91: "Protocol wrong type for socket", 92: "Protocol not available", 93: "Unknown protocol", 94: "Socket type not supported", 95: "Not supported", 96: "Protocol family not supported", 97: "Address family not supported by protocol family", 98: "Address already in use", 99: "Address not available", 100: "Network interface is not configured", 101: "Network is unreachable", 102: "Connection reset by network", 103: "Connection aborted", 104: "Connection reset by peer", 105: "No buffer space available", 106: "Socket is already connected", 107: "Socket is not connected", 108: "Can't send after socket shutdown", 109: "Too many references", 110: "Connection timed out", 111: "Connection refused", 112: "Host is down", 113: "Host is unreachable", 114: "Socket already connected", 115: "Connection already in progress", 116: "Stale file handle", 122: "Quota exceeded", 123: "No medium (in tape drive)", 125: "Operation canceled", 130: "Previous owner died", 131: "State not recoverable" };
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    var PATH = { splitPath: (function (filename: any) { var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/; return splitPathRe.exec(filename).slice(1); }), normalizeArray: (function (parts: any, allowAboveRoot: any) { var up = 0; for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1);
            }
            else if (last === "..") {
                parts.splice(i, 1);
                up++;
            }
            else if (up) {
                parts.splice(i, 1);
                up--;
            }
        } if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..");
            }
        } return parts; }), normalize: (function (path: any) { var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/"; path = PATH.normalizeArray(path.split("/").filter((function (p: any) { return !!p; })), !isAbsolute).join("/"); if (!path && !isAbsolute) {
            path = ".";
        } if (path && trailingSlash) {
            path += "/";
        } return (isAbsolute ? "/" : "") + path; }), dirname: (function (path: any) { var result = PATH.splitPath(path), root = result[0], dir = result[1]; if (!root && !dir) {
            return ".";
        } if (dir) {
            dir = dir.substr(0, dir.length - 1);
        } return root + dir; }), basename: (function (path: any) { if (path === "/")
            return "/"; var lastSlash = path.lastIndexOf("/"); if (lastSlash === -1)
            return path; return path.substr(lastSlash + 1); }), extname: (function (path: any) { return PATH.splitPath(path)[3]; }), join: (function () { var paths = Array.prototype.slice.call(arguments, 0); return PATH.normalize(paths.join("/")); }), join2: (function (l: any, r: any) { return PATH.normalize(l + "/" + r); }), resolve: (function () { var resolvedPath = "", resolvedAbsolute = false; for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path !== "string") {
                throw new TypeError("Arguments to path.resolve must be strings");
            }
            else if (!path) {
                return "";
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = path.charAt(0) === "/";
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        } resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((function (p) { return !!p; })), !resolvedAbsolute).join("/"); return (resolvedAbsolute ? "/" : "") + resolvedPath || "."; }), relative: (function (from: any, to: any) { from = PATH.resolve(from).substr(1); to = PATH.resolve(to).substr(1); function trim(arr: any) { var start = 0; for (; start < arr.length; start++) {
            if (arr[start] !== "")
                break;
        } var end = arr.length - 1; for (; end >= 0; end--) {
            if (arr[end] !== "")
                break;
        } if (start > end)
            return []; return arr.slice(start, end - start + 1); } var fromParts = trim(from.split("/")); var toParts = trim(to.split("/")); var length = Math.min(fromParts.length, toParts.length); var samePartsLength = length; for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break;
            }
        } var outputParts = []; for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..");
        } outputParts = outputParts.concat(toParts.slice(samePartsLength)); return outputParts.join("/"); }) };
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'never[]' is not assignable to type 'never'.
    var TTY = { ttys: [], init: (function () { }), shutdown: (function () { }), register: (function (dev: any, ops: any) { TTY.ttys[dev] = { input: [], output: [], ops: ops }; FS.registerDevice(dev, TTY.stream_ops); }), stream_ops: { open: (function (stream: any) { var tty = TTY.ttys[stream.node.rdev]; if (!tty) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            } stream.tty = tty; stream.seekable = false; }), close: (function (stream: any) { stream.tty.ops.flush(stream.tty); }), flush: (function (stream: any) { stream.tty.ops.flush(stream.tty); }), read: (function (stream: any, buffer: any, offset: any, length: any, pos: any) { if (!stream.tty || !stream.tty.ops.get_char) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
            } var bytesRead = 0; for (var i = 0; i < length; i++) {
                var result;
                try {
                    result = stream.tty.ops.get_char(stream.tty);
                }
                catch (e) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
                if (result === undefined && bytesRead === 0) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                }
                if (result === null || result === undefined)
                    break;
                bytesRead++;
                buffer[offset + i] = result;
            } if (bytesRead) {
                stream.node.timestamp = Date.now();
            } return bytesRead; }), write: (function (stream: any, buffer: any, offset: any, length: any, pos: any) { if (!stream.tty || !stream.tty.ops.put_char) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
            } for (var i = 0; i < length; i++) {
                try {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
                }
                catch (e) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
            } if (length) {
                stream.node.timestamp = Date.now();
            } return i; }) }, default_tty_ops: { get_char: (function (tty: any) { if (!tty.input.length) {
                var result = null;
                if (ENVIRONMENT_IS_NODE) {
                    var BUFSIZE = 256;
                    var buf = new Buffer(BUFSIZE);
                    var bytesRead = 0;
                    var isPosixPlatform = process.platform != "win32";
                    var fd = process.stdin.fd;
                    if (isPosixPlatform) {
                        var usingDevice = false;
                        try {
                            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                            fd = fs.openSync("/dev/stdin", "r");
                            usingDevice = true;
                        }
                        catch (e) { }
                    }
                    try {
                        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                        bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
                    }
                    catch (e) {
                        if (e.toString().indexOf("EOF") != -1)
                            bytesRead = 0;
                        else
                            throw e;
                    }
                    // @ts-expect-error ts-migrate(2454) FIXME: Variable 'usingDevice' is used before being assign... Remove this comment to see the full error message
                    if (usingDevice) {
                        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                        fs.closeSync(fd);
                    }
                    if (bytesRead > 0) {
                        result = buf.slice(0, bytesRead).toString("utf-8");
                    }
                    else {
                        result = null;
                    }
                }
                else if (typeof window != "undefined" && typeof window.prompt == "function") {
                    result = window.prompt("Input: ");
                    if (result !== null) {
                        result += "\n";
                    }
                }
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'readline'.
                else if (typeof readline == "function") {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'readline'.
                    result = readline();
                    if (result !== null) {
                        result += "\n";
                    }
                }
                if (!result) {
                    return null;
                }
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                tty.input = intArrayFromString(result, true);
            } return tty.input.shift(); }), put_char: (function (tty: any, val: any) { if (val === null || val === 10) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                Module["print"](UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            }
            else {
                if (val != 0)
                    tty.output.push(val);
            } }), flush: (function (tty: any) { if (tty.output && tty.output.length > 0) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                Module["print"](UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            } }) }, default_tty1_ops: { put_char: (function (tty: any, val: any) { if (val === null || val === 10) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                Module["printErr"](UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            }
            else {
                if (val != 0)
                    tty.output.push(val);
            } }), flush: (function (tty: any) { if (tty.output && tty.output.length > 0) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                Module["printErr"](UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            } }) } };
    var MEMFS = { ops_table: null, mount: (function (mount: any) { return MEMFS.createNode(null, "/", 16384 | 511, 0); }), createNode: (function (parent: any, name: any, mode: any, dev: any) { if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } if (!MEMFS.ops_table) {
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ dir: { node: { getattr: (node: any) => {};... Remove this comment to see the full error message
            MEMFS.ops_table = { dir: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink }, stream: { llseek: MEMFS.stream_ops.llseek } }, file: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: { llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, allocate: MEMFS.stream_ops.allocate, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync } }, link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops } };
        } var node = FS.createNode(parent, name, mode, dev); if (FS.isDir(node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.node_ops = MEMFS.ops_table.dir.node;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {};
        }
        else if (FS.isFile(node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.node_ops = MEMFS.ops_table.file.node;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null;
        }
        else if (FS.isLink(node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.node_ops = MEMFS.ops_table.link.node;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.stream_ops = MEMFS.ops_table.link.stream;
        }
        else if (FS.isChrdev(node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.node_ops = MEMFS.ops_table.chrdev.node;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.stream_ops = MEMFS.ops_table.chrdev.stream;
        } node.timestamp = Date.now(); if (parent) {
            parent.contents[name] = node;
        } return node; }), getFileDataAsRegularArray: (function (node: any) { if (node.contents && node.contents.subarray) {
            var arr = [];
            for (var i = 0; i < node.usedBytes; ++i)
                arr.push(node.contents[i]);
            return arr;
        } return node.contents; }), getFileDataAsTypedArray: (function (node: any) { if (!node.contents)
            return new Uint8Array; if (node.contents.subarray)
            return node.contents.subarray(0, node.usedBytes); return new Uint8Array(node.contents); }), expandFileStorage: (function (node: any, newCapacity: any) { if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
            node.contents = MEMFS.getFileDataAsRegularArray(node);
            node.usedBytes = node.contents.length;
        } if (!node.contents || node.contents.subarray) {
            var prevCapacity = node.contents ? node.contents.length : 0;
            if (prevCapacity >= newCapacity)
                return;
            var CAPACITY_DOUBLING_MAX = 1024 * 1024;
            newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
            if (prevCapacity != 0)
                newCapacity = Math.max(newCapacity, 256);
            var oldContents = node.contents;
            node.contents = new Uint8Array(newCapacity);
            if (node.usedBytes > 0)
                node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
            return;
        } if (!node.contents && newCapacity > 0)
            node.contents = []; while (node.contents.length < newCapacity)
            node.contents.push(0); }), resizeFileStorage: (function (node: any, newSize: any) { if (node.usedBytes == newSize)
            return; if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
            return;
        } if (!node.contents || node.contents.subarray) {
            var oldContents = node.contents;
            node.contents = new Uint8Array(new ArrayBuffer(newSize));
            if (oldContents) {
                node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
            }
            node.usedBytes = newSize;
            return;
        } if (!node.contents)
            node.contents = []; if (node.contents.length > newSize)
            node.contents.length = newSize;
        else
            while (node.contents.length < newSize)
                node.contents.push(0); node.usedBytes = newSize; }), node_ops: { getattr: (function (node: any) { var attr = {}; (attr as any).dev = FS.isChrdev(node.mode) ? node.id : 1; (attr as any).ino = node.id; (attr as any).mode = node.mode; (attr as any).nlink = 1; (attr as any).uid = 0; (attr as any).gid = 0; (attr as any).rdev = node.rdev; if (FS.isDir(node.mode)) {
                (attr as any).size = 4096;
            }
            else if (FS.isFile(node.mode)) {
                (attr as any).size = node.usedBytes;
            }
            else if (FS.isLink(node.mode)) {
                (attr as any).size = node.link.length;
            }
            else {
                (attr as any).size = 0;
            } (attr as any).atime = new Date(node.timestamp); (attr as any).mtime = new Date(node.timestamp); (attr as any).ctime = new Date(node.timestamp); (attr as any).blksize = 4096; (attr as any).blocks = Math.ceil((attr as any).size / (attr as any).blksize); return attr; }), setattr: (function (node: any, attr: any) { if (attr.mode !== undefined) {
                node.mode = attr.mode;
            } if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp;
            } if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            } }), lookup: (function (parent: any, name: any) { throw FS.genericErrors[ERRNO_CODES.ENOENT]; }), mknod: (function (parent: any, name: any, mode: any, dev: any) { return MEMFS.createNode(parent, name, mode, dev); }), rename: (function (old_node: any, new_dir: any, new_name: any) { if (FS.isDir(old_node.mode)) {
                var new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name);
                }
                catch (e) { }
                if (new_node) {
                    for (var i in new_node.contents) {
                        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                        throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
                    }
                }
            } delete old_node.parent.contents[old_node.name]; old_node.name = new_name; new_dir.contents[new_name] = old_node; old_node.parent = new_dir; }), unlink: (function (parent: any, name: any) { delete parent.contents[name]; }), rmdir: (function (parent: any, name: any) { var node = FS.lookupNode(parent, name); for (var i in node.contents) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
            } delete parent.contents[name]; }), readdir: (function (node: any) { var entries = [".", ".."]; for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue;
                }
                entries.push(key);
            } return entries; }), symlink: (function (parent: any, newname: any, oldpath: any) { var node = MEMFS.createNode(parent, newname, 511 | 40960, 0); node.link = oldpath; return node; }), readlink: (function (node: any) { if (!FS.isLink(node.mode)) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            } return node.link; }) }, stream_ops: { read: (function (stream: any, buffer: any, offset: any, length: any, position: any) { var contents = stream.node.contents; if (position >= stream.node.usedBytes)
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                return 0; var size = Math.min(stream.node.usedBytes - position, length); assert(size >= 0); if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset);
            }
            else {
                for (var i = 0; i < size; i++)
                    buffer[offset + i] = contents[position + i];
            } return size; }), write: (function (stream: any, buffer: any, offset: any, length: any, position: any, canOwn: any) { if (!length)
                return 0; var node = stream.node; node.timestamp = Date.now(); if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length;
                }
                else if (node.usedBytes === 0 && position === 0) {
                    node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
                    node.usedBytes = length;
                    return length;
                }
                else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length;
                }
            } MEMFS.expandFileStorage(node, position + length); if (node.contents.subarray && buffer.subarray)
                node.contents.set(buffer.subarray(offset, offset + length), position);
            else {
                for (var i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i];
                }
            } node.usedBytes = Math.max(node.usedBytes, position + length); return length; }), llseek: (function (stream: any, offset: any, whence: any) { var position = offset; if (whence === 1) {
                position += stream.position;
            }
            else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes;
                }
            } if (position < 0) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            } return position; }), allocate: (function (stream: any, offset: any, length: any) { MEMFS.expandFileStorage(stream.node, offset + length); stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length); }), mmap: (function (stream: any, buffer: any, offset: any, length: any, position: any, prot: any, flags: any) { if (!FS.isFile(stream.node.mode)) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            } var ptr; var allocated; var contents = stream.node.contents; if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
                allocated = false;
                ptr = contents.byteOffset;
            }
            else {
                if (position > 0 || position + length < stream.node.usedBytes) {
                    if (contents.subarray) {
                        contents = contents.subarray(position, position + length);
                    }
                    else {
                        contents = Array.prototype.slice.call(contents, position, position + length);
                    }
                }
                allocated = true;
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
                ptr = _malloc(length);
                if (!ptr) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
                }
                buffer.set(contents, ptr);
            } return { ptr: ptr, allocated: allocated }; }), msync: (function (stream: any, buffer: any, offset: any, length: any, mmapFlags: any) { if (!FS.isFile(stream.node.mode)) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            } if (mmapFlags & 2) {
                return 0;
            } var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false); return 0; }) } };
    var IDBFS = { dbs: {}, indexedDB: (function () { if (typeof indexedDB !== "undefined")
            return indexedDB; var ret = null; if (typeof window === "object")
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'msIndexedDB' does not exist on type 'Win... Remove this comment to see the full error message
            ret = window.indexedDB || (window as any).mozIndexedDB || (window as any).webkitIndexedDB || window.msIndexedDB; assert(ret, "IDBFS used, but indexedDB not supported"); return ret; }), DB_VERSION: 21, DB_STORE_NAME: "FILE_DATA", mount: (function (mount: any) { return MEMFS.mount.apply(null, arguments); }), syncfs: (function (mount: any, populate: any, callback: any) { IDBFS.getLocalSet(mount, (function (err: any, local: any) { if (err)
            return callback(err); IDBFS.getRemoteSet(mount, (function (err: any, remote: any) { if (err)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            return callback(err); var src = populate ? remote : local; var dst = populate ? local : remote; IDBFS.reconcile(src, dst, callback); })); })); }), getDB: (function (name: any, callback: any) { var db = IDBFS.dbs[name]; if (db) {
            return callback(null, db);
        } var req: any; try {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        }
        catch (e) {
            return callback(e);
        } if (!req) {
            return callback("Unable to connect to IndexedDB");
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'e' implicitly has an 'any' type.
        } req.onupgradeneeded = (function (e) { var db = e.target.result; var transaction = e.target.transaction; var fileStore; if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
        }
        else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
        } if (!fileStore.indexNames.contains("timestamp")) {
            fileStore.createIndex("timestamp", "timestamp", { unique: false });
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        } }); req.onsuccess = (function () { db = req.result; IDBFS.dbs[name] = db; callback(null, db); }); req.onerror = (function (e) { callback(this.error); e.preventDefault(); }); }), getLocalSet: (function (mount: any, callback: any) { var entries = {}; function isRealDir(p: any) { return p !== "." && p !== ".."; } function toAbsolute(root: any) { return function (p: any) { return PATH.join2(root, p); }; } var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint)); while (check.length) {
            var path = check.pop();
            var stat;
            try {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                stat = FS.stat(path);
            }
            catch (e) {
                return callback(e);
            }
            if (FS.isDir(stat.mode)) {
                check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            entries[path] = { timestamp: stat.mtime };
        } return callback(null, { type: "local", entries: entries }); }), getRemoteSet: (function (mount: any, callback: any) { var entries = {}; IDBFS.getDB(mount.mountpoint, (function (err: any, db: any) { if (err)
            return callback(err); try {
            var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
            transaction.onerror = (function (e: any) { callback(this.error); e.preventDefault(); });
            var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
            var index = store.index("timestamp");
            index.openKeyCursor().onsuccess = (function (event: any) { var cursor = event.target.result; if (!cursor) {
                return callback(null, { type: "remote", db: db, entries: entries });
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            } entries[cursor.primaryKey] = { timestamp: cursor.key }; cursor.continue(); });
        }
        catch (e) {
            return callback(e);
        } })); }), loadLocalEntry: (function (path: any, callback: any) { var stat, node; try {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            stat = FS.stat(path);
        }
        catch (e) {
            return callback(e);
        } if (FS.isDir(stat.mode)) {
            return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        }
        else if (FS.isFile(stat.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            node.contents = MEMFS.getFileDataAsTypedArray(node);
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        }
        else {
            return callback(new Error("node type not supported"));
        } }), storeLocalEntry: (function (path: any, entry: any, callback: any) { try {
            if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
            }
            else if (FS.isFile(entry.mode)) {
                FS.writeFile(path, entry.contents, { canOwn: true });
            }
            else {
                return callback(new Error("node type not supported"));
            }
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            FS.chmod(path, entry.mode);
            FS.utime(path, entry.timestamp, entry.timestamp);
        }
        catch (e) {
            return callback(e);
        } callback(null); }), removeLocalEntry: (function (path: any, callback: any) { try {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            var lookup = FS.lookupPath(path);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            var stat = FS.stat(path);
            if (FS.isDir(stat.mode)) {
                FS.rmdir(path);
            }
            else if (FS.isFile(stat.mode)) {
                FS.unlink(path);
            }
        }
        catch (e) {
            return callback(e);
        } callback(null); }), loadRemoteEntry: (function (store: any, path: any, callback: any) { var req = store.get(path); req.onsuccess = (function (event: any) { callback(null, event.target.result); }); req.onerror = (function (e: any) { callback(this.error); e.preventDefault(); }); }), storeRemoteEntry: (function (store: any, path: any, entry: any, callback: any) { var req = store.put(entry, path); req.onsuccess = (function () { callback(null); }); req.onerror = (function (e: any) { callback(this.error); e.preventDefault(); }); }), removeRemoteEntry: (function (store: any, path: any, callback: any) { var req = store.delete(path); req.onsuccess = (function () { callback(null); }); req.onerror = (function (e: any) { callback(this.error); e.preventDefault(); }); }), reconcile: (function (src: any, dst: any, callback: any) { var total = 0; var create: any = []; Object.keys(src.entries).forEach((function (key) { var e = src.entries[key]; var e2 = dst.entries[key]; if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
        } })); var remove: any = []; Object.keys(dst.entries).forEach((function (key) { var e = dst.entries[key]; var e2 = src.entries[key]; if (!e2) {
            remove.push(key);
            total++;
        } })); if (!total) {
            return callback(null);
        } var completed = 0; var db = src.type === "remote" ? src.db : dst.db; var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite"); var store = transaction.objectStore(IDBFS.DB_STORE_NAME); function done(err: any) { if (err) {
            if (!(done as any).errored) {
                (done as any).errored = true;
                return callback(err);
            }
            return;
        } if (++completed >= total) {
            return callback(null);
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'path' implicitly has an 'any' type.
        } } transaction.onerror = (function (e: any) { done(this.error); e.preventDefault(); }); create.sort().forEach((function (path) { if (dst.type === "local") {
            IDBFS.loadRemoteEntry(store, path, (function (err: any, entry: any) { if (err)
                return done(err); IDBFS.storeLocalEntry(path, entry, done); }));
        }
        else {
            IDBFS.loadLocalEntry(path, (function (err: any, entry: any) { if (err)
                return done(err); IDBFS.storeRemoteEntry(store, path, entry, done); }));
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'path' implicitly has an 'any' type.
        } })); remove.sort().reverse().forEach((function (path) { if (dst.type === "local") {
            IDBFS.removeLocalEntry(path, done);
        }
        else {
            IDBFS.removeRemoteEntry(store, path, done);
        } })); }) };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var NODEFS = { isWindows: false, staticInit: (function () { NODEFS.isWindows = !!process.platform.match(/^win/); var flags = process["binding"]("constants"); if (flags["fs"]) {
            flags = flags["fs"];
        // @ts-expect-error ts-migrate(2774) FIXME: This condition will always return true since the f... Remove this comment to see the full error message
        } (NODEFS as any).flagsForNodeMap = { "1024": flags["O_APPEND"], "64": flags["O_CREAT"], "128": flags["O_EXCL"], "0": flags["O_RDONLY"], "2": flags["O_RDWR"], "4096": flags["O_SYNC"], "512": flags["O_TRUNC"], "1": flags["O_WRONLY"] }; }), bufferFrom: (function (arrayBuffer: any) { return Buffer.alloc ? Buffer.from(arrayBuffer) : new Buffer(arrayBuffer); }), mount: (function (mount: any) { assert(ENVIRONMENT_IS_NODE); return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0); }), createNode: (function (parent: any, name: any, mode: any, dev: any) { if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        } var node = FS.createNode(parent, name, mode); node.node_ops = NODEFS.node_ops; node.stream_ops = NODEFS.stream_ops; return node; }), getMode: (function (path: any) { var stat; try {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
            stat = fs.lstatSync(path);
            if (NODEFS.isWindows) {
                stat.mode = stat.mode | (stat.mode & 292) >> 2;
            }
        }
        catch (e) {
            if (!e.code)
                throw e;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        } return stat.mode; }), realPath: (function (node: any) { var parts = []; while (node.parent !== node) {
            parts.push(node.name);
            node = node.parent;
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any[]' is not assignable to para... Remove this comment to see the full error message
        } parts.push(node.mount.opts.root); parts.reverse(); return PATH.join.apply(null, parts); }), flagsForNode: (function (flags: any) { flags &= ~2097152; flags &= ~2048; flags &= ~32768; flags &= ~524288; var newFlags = 0; for (var k in (NODEFS as any).flagsForNodeMap) {
            // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
            if (flags & k) {
                newFlags |= (NODEFS as any).flagsForNodeMap[k];
                // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
                flags ^= k;
            }
        } if (!flags) {
            return newFlags;
        }
        else {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } }), node_ops: { getattr: (function (node: any) { var path = NODEFS.realPath(node); var stat; try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                stat = fs.lstatSync(path);
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } if (NODEFS.isWindows && !stat.blksize) {
                stat.blksize = 4096;
            } if (NODEFS.isWindows && !stat.blocks) {
                stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0;
            } return { dev: stat.dev, ino: stat.ino, mode: stat.mode, nlink: stat.nlink, uid: stat.uid, gid: stat.gid, rdev: stat.rdev, size: stat.size, atime: stat.atime, mtime: stat.mtime, ctime: stat.ctime, blksize: stat.blksize, blocks: stat.blocks }; }), setattr: (function (node: any, attr: any) { var path = NODEFS.realPath(node); try {
                if (attr.mode !== undefined) {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                    fs.chmodSync(path, attr.mode);
                    node.mode = attr.mode;
                }
                if (attr.timestamp !== undefined) {
                    var date = new Date(attr.timestamp);
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                    fs.utimesSync(path, date, date);
                }
                if (attr.size !== undefined) {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                    fs.truncateSync(path, attr.size);
                }
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
            } }), lookup: (function (parent: any, name: any) { var path = PATH.join2(NODEFS.realPath(parent), name); var mode = NODEFS.getMode(path); return NODEFS.createNode(parent, name, mode); }), mknod: (function (parent: any, name: any, mode: any, dev: any) { var node = NODEFS.createNode(parent, name, mode, dev); var path = NODEFS.realPath(node); try {
                if (FS.isDir(node.mode)) {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                    fs.mkdirSync(path, node.mode);
                }
                else {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                    fs.writeFileSync(path, "", { mode: node.mode });
                }
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } return node; }), rename: (function (oldNode: any, newDir: any, newName: any) { var oldPath = NODEFS.realPath(oldNode); var newPath = PATH.join2(NODEFS.realPath(newDir), newName); try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                fs.renameSync(oldPath, newPath);
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), unlink: (function (parent: any, name: any) { var path = PATH.join2(NODEFS.realPath(parent), name); try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                fs.unlinkSync(path);
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), rmdir: (function (parent: any, name: any) { var path = PATH.join2(NODEFS.realPath(parent), name); try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                fs.rmdirSync(path);
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), readdir: (function (node: any) { var path = NODEFS.realPath(node); try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                return fs.readdirSync(path);
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), symlink: (function (parent: any, newName: any, oldPath: any) { var newPath = PATH.join2(NODEFS.realPath(parent), newName); try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                fs.symlinkSync(oldPath, newPath);
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), readlink: (function (node: any) { var path = NODEFS.realPath(node); try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                path = fs.readlinkSync(path);
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'NODEJS_PATH'.
                path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
                return path;
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }) }, stream_ops: { open: (function (stream: any) { var path = NODEFS.realPath(stream.node); try {
                if (FS.isFile(stream.node.mode)) {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                    stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags));
                }
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), close: (function (stream: any) { try {
                if (FS.isFile(stream.node.mode) && stream.nfd) {
                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                    fs.closeSync(stream.nfd);
                }
            }
            catch (e) {
                if (!e.code)
                    throw e;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), read: (function (stream: any, buffer: any, offset: any, length: any, position: any) { if (length === 0)
                return 0; try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                return fs.readSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position);
            }
            catch (e) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), write: (function (stream: any, buffer: any, offset: any, length: any, position: any) { try {
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                return fs.writeSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position);
            }
            catch (e) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
            } }), llseek: (function (stream: any, offset: any, whence: any) { var position = offset; if (whence === 1) {
                position += stream.position;
            }
            else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    try {
                        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fs'.
                        var stat = fs.fstatSync(stream.nfd);
                        position += stat.size;
                    }
                    catch (e) {
                        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
                    }
                }
            } if (position < 0) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            } return position; }) } };
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    var WORKERFS = { DIR_MODE: 16895, FILE_MODE: 33279, reader: null, mount: (function (mount: any) { assert(ENVIRONMENT_IS_WORKER); if (!WORKERFS.reader)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'FileReaderSync'.
            WORKERFS.reader = new FileReaderSync; var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0); var createdParents = {}; function ensureParent(path: any) { var parts = path.split("/"); var parent = root; for (var i = 0; i < parts.length - 1; i++) {
            var curr = parts.slice(0, i + 1).join("/");
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (!createdParents[curr]) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0);
            }
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            parent = createdParents[curr];
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 6 arguments, but got 5.
        } return parent; } function base(path: any) { var parts = path.split("/"); return parts[parts.length - 1]; } Array.prototype.forEach.call(mount.opts["files"] || [], (function (file) { WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate); })); (mount.opts["blobs"] || []).forEach((function (obj: any) { WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]); })); (mount.opts["packages"] || []).forEach((function (pack: any) { pack["metadata"].files.forEach((function (file: any) { var name = file.filename.substr(1); WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end)); })); })); return root; }), createNode: (function (parent: any, name: any, mode: any, dev: any, contents: any, mtime: any) { var node = FS.createNode(parent, name, mode); node.mode = mode; node.node_ops = WORKERFS.node_ops; node.stream_ops = WORKERFS.stream_ops; node.timestamp = (mtime || new Date).getTime(); assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE); if (mode === WORKERFS.FILE_MODE) {
            node.size = contents.size;
            node.contents = contents;
        }
        else {
            node.size = 4096;
            node.contents = {};
        } if (parent) {
            parent.contents[name] = node;
        } return node; }), node_ops: { getattr: (function (node: any) { return { dev: 1, ino: undefined, mode: node.mode, nlink: 1, uid: 0, gid: 0, rdev: undefined, size: node.size, atime: new Date(node.timestamp), mtime: new Date(node.timestamp), ctime: new Date(node.timestamp), blksize: 4096, blocks: Math.ceil(node.size / 4096) }; }), setattr: (function (node: any, attr: any) { if (attr.mode !== undefined) {
                node.mode = attr.mode;
            } if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            } }), lookup: (function (parent: any, name: any) { throw new FS.ErrnoError(ERRNO_CODES.ENOENT); }), mknod: (function (parent: any, name: any, mode: any, dev: any) { throw new FS.ErrnoError(ERRNO_CODES.EPERM); }), rename: (function (oldNode: any, newDir: any, newName: any) { throw new FS.ErrnoError(ERRNO_CODES.EPERM); }), unlink: (function (parent: any, name: any) { throw new FS.ErrnoError(ERRNO_CODES.EPERM); }), rmdir: (function (parent: any, name: any) { throw new FS.ErrnoError(ERRNO_CODES.EPERM); }), readdir: (function (node: any) { var entries = [".", ".."]; for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue;
                }
                entries.push(key);
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            } return entries; }), symlink: (function (parent: any, newName: any, oldPath: any) { throw new FS.ErrnoError(ERRNO_CODES.EPERM); }), readlink: (function (node: any) { throw new FS.ErrnoError(ERRNO_CODES.EPERM); }) }, stream_ops: { read: (function (stream: any, buffer: any, offset: any, length: any, position: any) { if (position >= stream.node.size)
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                return 0; var chunk = stream.node.contents.slice(position, position + length); var ab = WORKERFS.reader.readAsArrayBuffer(chunk); buffer.set(new Uint8Array(ab), offset); return chunk.size; }), write: (function (stream: any, buffer: any, offset: any, length: any, position: any) { throw new FS.ErrnoError(ERRNO_CODES.EIO); }), llseek: (function (stream: any, offset: any, whence: any) { var position = offset; if (whence === 1) {
                position += stream.position;
            }
            else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.size;
                }
            } if (position < 0) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            } return position; }) } };
    STATICTOP += 16;
    STATICTOP += 16;
    STATICTOP += 16;
    // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
    var FS = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, trackingDelegate: {}, tracking: { openFlags: { READ: 1, WRITE: 2 } }, ErrnoError: null, genericErrors: {}, filesystems: null, syncFSRequests: 0, handleFSError: (function (e: any) { if (!(e instanceof FS.ErrnoError))
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
            throw e + " : " + stackTrace(); return ___setErrNo(e.errno); }), lookupPath: (function (path: any, opts: any) { path = PATH.resolve(FS.cwd(), path); opts = opts || {}; if (!path)
            return { path: "", node: null }; var defaults = { follow_mount: true, recurse_count: 0 }; for (var key in defaults) {
            if (opts[key] === undefined) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                opts[key] = defaults[key];
            }
        } if (opts.recurse_count > 8) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        } var parts = PATH.normalizeArray(path.split("/").filter((function (p: any) { return !!p; })), false); var current = FS.root; var current_path = "/"; for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break;
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || islast && opts.follow_mount) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    current = current.mounted.root;
                }
            }
            if (!islast || opts.follow) {
                var count = 0;
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                while (FS.isLink(current.mode)) {
                    var link = FS.readlink(current_path);
                    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
                    current_path = PATH.resolve(PATH.dirname(current_path), link);
                    var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
                    current = lookup.node;
                    if (count++ > 40) {
                        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                        throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
                    }
                }
            }
        } return { path: current_path, node: current }; }), getPath: (function (node: any) { var path; while (true) {
            if (FS.isRoot(node)) {
                var mount = node.mount.mountpoint;
                if (!path)
                    return mount;
                return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
            }
            path = path ? node.name + "/" + path : node.name;
            node = node.parent;
        } }), hashName: (function (parentid: any, name: any) { var hash = 0; for (var i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } return (parentid + hash >>> 0) % FS.nameTable.length; }), hashAddNode: (function (node: any) { var hash = FS.hashName(node.parent.id, node.name); node.name_next = FS.nameTable[hash]; FS.nameTable[hash] = node; }), hashRemoveNode: (function (node: any) { var hash = FS.hashName(node.parent.id, node.name); if (FS.nameTable[hash] === node) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            FS.nameTable[hash] = node.name_next;
        }
        else {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            var current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break;
                }
                current = current.name_next;
            }
        } }), lookupNode: (function (parent: any, name: any) { var err = FS.mayLookup(parent); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err, parent);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } var hash = FS.hashName(parent.id, name); for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node;
            }
        } return FS.lookup(parent, name); }), createNode: (function (parent: any, name: any, mode: any, rdev: any) { if (!(FS as any).FSNode) {
            (FS as any).FSNode = (function (parent: any, name: any, mode: any, rdev: any) { if (!parent) {
                parent = this;
            } (this as any).parent = parent; this.mount = parent.mount; this.mounted = null; (this as any).id = FS.nextInode++; (this as any).name = name; (this as any).mode = mode; (this as any).node_ops = {}; (this as any).stream_ops = {}; (this as any).rdev = rdev; });
            (FS as any).FSNode.prototype = {};
            var readMode = 292 | 73;
            var writeMode = 146;
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            Object.defineProperties((FS as any).FSNode.prototype, { read: { get: (function () { return (this.mode & readMode) === readMode; }), set: (function (val) { val ? this.mode |= readMode : this.mode &= ~readMode; }) }, write: { get: (function () { return (this.mode & writeMode) === writeMode; }), set: (function (val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }) }, isFolder: { get: (function () { return FS.isDir(this.mode); }) }, isDevice: { get: (function () { return FS.isChrdev(this.mode); }) } });
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        } var node = new (FS as any).FSNode(parent, name, mode, rdev); FS.hashAddNode(node); return node; }), destroyNode: (function (node: any) { FS.hashRemoveNode(node); }), isRoot: (function (node: any) { return node === node.parent; }), isMountpoint: (function (node: any) { return !!node.mounted; }), isFile: (function (mode: any) { return (mode & 61440) === 32768; }), isDir: (function (mode: any) { return (mode & 61440) === 16384; }), isLink: (function (mode: any) { return (mode & 61440) === 40960; }), isChrdev: (function (mode: any) { return (mode & 61440) === 8192; }), isBlkdev: (function (mode: any) { return (mode & 61440) === 24576; }), isFIFO: (function (mode: any) { return (mode & 61440) === 4096; }), isSocket: (function (mode: any) { return (mode & 49152) === 49152; }), flagModes: { "r": 0, "rs": 1052672, "r+": 2, "w": 577, "wx": 705, "xw": 705, "w+": 578, "wx+": 706, "xw+": 706, "a": 1089, "ax": 1217, "xa": 1217, "a+": 1090, "ax+": 1218, "xa+": 1218 }, modeStringToFlags: (function (str: any) { var flags = FS.flagModes[str]; if (typeof flags === "undefined") {
            throw new Error("Unknown file open mode: " + str);
        } return flags; }), flagsToPermissionString: (function (flag: any) { var perms = ["r", "w", "rw"][flag & 3]; if (flag & 512) {
            perms += "w";
        } return perms; }), nodePermissions: (function (node: any, perms: any) { if (FS.ignorePermissions) {
            return 0;
        } if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
            return ERRNO_CODES.EACCES;
        }
        else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
            return ERRNO_CODES.EACCES;
        }
        else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
            return ERRNO_CODES.EACCES;
        } return 0; }), mayLookup: (function (dir: any) { var err = FS.nodePermissions(dir, "x"); if (err)
            return err; if (!dir.node_ops.lookup)
            return ERRNO_CODES.EACCES; return 0; }), mayCreate: (function (dir: any, name: any) { try {
            var node = FS.lookupNode(dir, name);
            return ERRNO_CODES.EEXIST;
        }
        catch (e) { } return FS.nodePermissions(dir, "wx"); }), mayDelete: (function (dir: any, name: any, isdir: any) { var node; try {
            node = FS.lookupNode(dir, name);
        }
        catch (e) {
            return e.errno;
        } var err = FS.nodePermissions(dir, "wx"); if (err) {
            return err;
        } if (isdir) {
            if (!FS.isDir(node.mode)) {
                return ERRNO_CODES.ENOTDIR;
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return ERRNO_CODES.EBUSY;
            }
        }
        else {
            if (FS.isDir(node.mode)) {
                return ERRNO_CODES.EISDIR;
            }
        } return 0; }), mayOpen: (function (node: any, flags: any) { if (!node) {
            return ERRNO_CODES.ENOENT;
        } if (FS.isLink(node.mode)) {
            return ERRNO_CODES.ELOOP;
        }
        else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                return ERRNO_CODES.EISDIR;
            }
        } return FS.nodePermissions(node, FS.flagsToPermissionString(flags)); }), MAX_OPEN_FDS: 4096, nextfd: (function (fd_start: any, fd_end: any) { fd_start = fd_start || 0; fd_end = fd_end || FS.MAX_OPEN_FDS; for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
                return fd;
            }
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } throw new FS.ErrnoError(ERRNO_CODES.EMFILE); }), getStream: (function (fd: any) { return FS.streams[fd]; }), createStream: (function (stream: any, fd_start: any, fd_end: any) { if (!FS.FSStream) {
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'FSStream' does not exist on type '{ root... Remove this comment to see the full error message
            FS.FSStream = (function () { });
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'FSStream' does not exist on type '{ root... Remove this comment to see the full error message
            FS.FSStream.prototype = {};
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'FSStream' does not exist on type '{ root... Remove this comment to see the full error message
            Object.defineProperties(FS.FSStream.prototype, { object: { get: (function () { return this.node; }), set: (function (val) { this.node = val; }) }, isRead: { get: (function () { return (this.flags & 2097155) !== 1; }) }, isWrite: { get: (function () { return (this.flags & 2097155) !== 0; }) }, isAppend: { get: (function () { return this.flags & 1024; }) } });
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'FSStream' does not exist on type '{ root... Remove this comment to see the full error message
        } var newStream = new FS.FSStream; for (var p in stream) {
            newStream[p] = stream[p];
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
        } stream = newStream; var fd = FS.nextfd(fd_start, fd_end); stream.fd = fd; FS.streams[fd] = stream; return stream; }), closeStream: (function (fd: any) { FS.streams[fd] = null; }), chrdev_stream_ops: { open: (function (stream: any) { var device = FS.getDevice(stream.node.rdev); stream.stream_ops = device.stream_ops; if (stream.stream_ops.open) {
                stream.stream_ops.open(stream);
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            } }), llseek: (function () { throw new FS.ErrnoError(ERRNO_CODES.ESPIPE); }) }, major: (function (dev: any) { return dev >> 8; }), minor: (function (dev: any) { return dev & 255; }), makedev: (function (ma: any, mi: any) { return ma << 8 | mi; }), registerDevice: (function (dev: any, ops: any) { FS.devices[dev] = { stream_ops: ops }; }), getDevice: (function (dev: any) { return FS.devices[dev]; }), getMounts: (function (mount: any) { var mounts = []; var check = [mount]; while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
        } return mounts; }), syncfs: (function (populate: any, callback: any) { if (typeof populate === "function") {
            callback = populate;
            populate = false;
        } FS.syncFSRequests++; if (FS.syncFSRequests > 1) {
            console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } var mounts = FS.getMounts(FS.root.mount); var completed = 0; function doCallback(err: any) { assert(FS.syncFSRequests > 0); FS.syncFSRequests--; return callback(err); } function done(err: any) { if (err) {
            if (!(done as any).errored) {
                (done as any).errored = true;
                return doCallback(err);
            }
            return;
        } if (++completed >= mounts.length) {
            doCallback(null);
        } } mounts.forEach((function (mount) { if (!mount.type.syncfs) {
            return done(null);
        } mount.type.syncfs(mount, populate, done); })); }), mount: (function (type: any, opts: any, mountpoint: any) { var root = mountpoint === "/"; var pseudo = !mountpoint; var node; if (root && FS.root) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            }
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            if (!FS.isDir(node.mode)) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
            }
        } var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] }; var mountRoot = type.mount(mount); mountRoot.mount = mount; (mount as any).root = mountRoot; if (root) {
            FS.root = mountRoot;
        }
        else if (node) {
            (node as any).mounted = mount;
            if ((node as any).mount) {
                (node as any).mount.mounts.push(mount);
            }
        } return mountRoot; }), unmount: (function (mountpoint: any) { var lookup = FS.lookupPath(mountpoint, { follow_mount: false }); if (!FS.isMountpoint(lookup.node)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } var node = lookup.node; var mount = node.mounted; var mounts = FS.getMounts(mount); Object.keys(FS.nameTable).forEach((function (hash) { var current = FS.nameTable[hash]; while (current) {
            var next = current.name_next;
            if (mounts.indexOf(current.mount) !== -1) {
                FS.destroyNode(current);
            }
            current = next;
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } })); node.mounted = null; var idx = node.mount.mounts.indexOf(mount); assert(idx !== -1); node.mount.mounts.splice(idx, 1); }), lookup: (function (parent: any, name: any) { return parent.node_ops.lookup(parent, name); }), mknod: (function (path: any, mode: any, dev: any) { var lookup = FS.lookupPath(path, { parent: true }); var parent = lookup.node; var name = PATH.basename(path); if (!name || name === "." || name === "..") {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } var err = FS.mayCreate(parent, name); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } if (!parent.node_ops.mknod) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } return parent.node_ops.mknod(parent, name, mode, dev); }), create: (function (path: any, mode: any) { mode = mode !== undefined ? mode : 438; mode &= 4095; mode |= 32768; return FS.mknod(path, mode, 0); }), mkdir: (function (path: any, mode: any) { mode = mode !== undefined ? mode : 511; mode &= 511 | 512; mode |= 16384; return FS.mknod(path, mode, 0); }), mkdirTree: (function (path: any, mode: any) { var dirs = path.split("/"); var d = ""; for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i])
                continue;
            d += "/" + dirs[i];
            try {
                FS.mkdir(d, mode);
            }
            catch (e) {
                if (e.errno != ERRNO_CODES.EEXIST)
                    throw e;
            }
        } }), mkdev: (function (path: any, mode: any, dev: any) { if (typeof dev === "undefined") {
            dev = mode;
            mode = 438;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        } mode |= 8192; return FS.mknod(path, mode, dev); }), symlink: (function (oldpath: any, newpath: any) { if (!PATH.resolve(oldpath)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        } var lookup = FS.lookupPath(newpath, { parent: true }); var parent = lookup.node; if (!parent) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        } var newname = PATH.basename(newpath); var err = FS.mayCreate(parent, newname); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err);
        } if (!(parent as any).node_ops.symlink) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } return (parent as any).node_ops.symlink(parent, newname, oldpath); }), rename: (function (old_path: any, new_path: any) { var old_dirname = PATH.dirname(old_path); var new_dirname = PATH.dirname(new_path); var old_name = PATH.basename(old_path); var new_name = PATH.basename(new_path); var lookup, old_dir, new_dir; try {
            lookup = FS.lookupPath(old_path, { parent: true });
            old_dir = lookup.node;
            lookup = FS.lookupPath(new_path, { parent: true });
            new_dir = lookup.node;
        }
        catch (e) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } if (!old_dir || !new_dir)
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT); if ((old_dir as any).mount !== (new_dir as any).mount) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        } var old_node = FS.lookupNode(old_dir, old_name); var relative = PATH.relative(old_path, new_dirname); if (relative.charAt(0) !== ".") {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } relative = PATH.relative(new_path, old_dirname); if (relative.charAt(0) !== ".") {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        } var new_node; try {
            new_node = FS.lookupNode(new_dir, new_name);
        }
        catch (e) { } if (old_node === new_node) {
            return;
        } var isdir = FS.isDir(old_node.mode); var err = FS.mayDelete(old_dir, old_name, isdir); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err);
        } err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err);
        } if (!(old_dir as any).node_ops.rename) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } if (new_dir !== old_dir) {
            err = FS.nodePermissions(old_dir, "w");
            if (err) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(err);
            }
        } try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (FS.trackingDelegate["willMovePath"]) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                FS.trackingDelegate["willMovePath"](old_path, new_path);
            }
        }
        catch (e) {
            console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
        } FS.hashRemoveNode(old_node); try {
            (old_dir as any).node_ops.rename(old_node, new_dir, new_name);
        }
        catch (e) {
            throw e;
        }
        finally {
            FS.hashAddNode(old_node);
        } try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (FS.trackingDelegate["onMovePath"])
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                FS.trackingDelegate["onMovePath"](old_path, new_path);
        }
        catch (e) {
            console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
        } }), rmdir: (function (path: any) { var lookup = FS.lookupPath(path, { parent: true }); var parent = lookup.node; var name = PATH.basename(path); var node = FS.lookupNode(parent, name); var err = FS.mayDelete(parent, name, true); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } if (!parent.node_ops.rmdir) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } if (FS.isMountpoint(node)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (FS.trackingDelegate["willDeletePath"]) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                FS.trackingDelegate["willDeletePath"](path);
            }
        }
        catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } parent.node_ops.rmdir(parent, name); FS.destroyNode(node); try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (FS.trackingDelegate["onDeletePath"])
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                FS.trackingDelegate["onDeletePath"](path);
        }
        catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } }), readdir: (function (path: any) { var lookup = FS.lookupPath(path, { follow: true }); var node = lookup.node; if (!node.node_ops.readdir) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } return node.node_ops.readdir(node); }), unlink: (function (path: any) { var lookup = FS.lookupPath(path, { parent: true }); var parent = lookup.node; var name = PATH.basename(path); var node = FS.lookupNode(parent, name); var err = FS.mayDelete(parent, name, false); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } if (!parent.node_ops.unlink) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } if (FS.isMountpoint(node)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (FS.trackingDelegate["willDeletePath"]) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                FS.trackingDelegate["willDeletePath"](path);
            }
        }
        catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } parent.node_ops.unlink(parent, name); FS.destroyNode(node); try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (FS.trackingDelegate["onDeletePath"])
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                FS.trackingDelegate["onDeletePath"](path);
        }
        catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        } }), readlink: (function (path: any) { var lookup = FS.lookupPath(path); var link = lookup.node; if (!link) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        } if (!(link as any).node_ops.readlink) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
        } return PATH.resolve(FS.getPath((link as any).parent), (link as any).node_ops.readlink(link)); }), stat: (function (path: any, dontFollow: any) { var lookup = FS.lookupPath(path, { follow: !dontFollow }); var node = lookup.node; if (!node) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        } if (!(node as any).node_ops.getattr) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } return (node as any).node_ops.getattr(node); }), lstat: (function (path: any) { return FS.stat(path, true); }), chmod: (function (path: any, mode: any, dontFollow: any) { var node; if (typeof path === "string") {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
        }
        else {
            node = path;
        } if (!node.node_ops.setattr) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } node.node_ops.setattr(node, { mode: mode & 4095 | node.mode & ~4095, timestamp: Date.now() }); }), lchmod: (function (path: any, mode: any) { FS.chmod(path, mode, true); }), fchmod: (function (fd: any, mode: any) { var stream = FS.getStream(fd); if (!stream) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        } FS.chmod((stream as any).node, mode); }), chown: (function (path: any, uid: any, gid: any, dontFollow: any) { var node; if (typeof path === "string") {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
        }
        else {
            node = path;
        } if (!node.node_ops.setattr) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } node.node_ops.setattr(node, { timestamp: Date.now() }); }), lchown: (function (path: any, uid: any, gid: any) { FS.chown(path, uid, gid, true); }), fchown: (function (fd: any, uid: any, gid: any) { var stream = FS.getStream(fd); if (!stream) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        } FS.chown((stream as any).node, uid, gid); }), truncate: (function (path: any, len: any) { if (len < 0) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } var node; if (typeof path === "string") {
            var lookup = FS.lookupPath(path, { follow: true });
            node = lookup.node;
        }
        else {
            node = path;
        } if (!node.node_ops.setattr) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        } if (FS.isDir(node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        } if (!FS.isFile(node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } var err = FS.nodePermissions(node, "w"); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err);
        } node.node_ops.setattr(node, { size: len, timestamp: Date.now() }); }), ftruncate: (function (fd: any, len: any) { var stream = FS.getStream(fd); if (!stream) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if (((stream as any).flags & 2097155) === 0) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } FS.truncate((stream as any).node, len); }), utime: (function (path: any, atime: any, mtime: any) { var lookup = FS.lookupPath(path, { follow: true }); var node = lookup.node; node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) }); }), open: (function (path: any, flags: any, mode: any, fd_start: any, fd_end: any) { if (path === "") {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        } flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags; mode = typeof mode === "undefined" ? 438 : mode; if (flags & 64) {
            mode = mode & 4095 | 32768;
        }
        else {
            mode = 0;
        } var node; if (typeof path === "object") {
            node = path;
        }
        else {
            path = PATH.normalize(path);
            try {
                var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
                node = lookup.node;
            }
            catch (e) { }
        } var created = false; if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
                }
            }
            else {
                node = FS.mknod(path, mode, 0);
                created = true;
            }
        } if (!node) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        } if (FS.isChrdev(node.mode)) {
            flags &= ~512;
        } if (flags & 65536 && !FS.isDir(node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        } if (!created) {
            var err = FS.mayOpen(node, flags);
            if (err) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                throw new FS.ErrnoError(err);
            }
        } if (flags & 512) {
            FS.truncate(node, 0);
        } flags &= ~(128 | 512); var stream = FS.createStream({ node: node, path: FS.getPath(node), flags: flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false }, fd_start, fd_end); if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        } if (Module["logReadFiles"] && !(flags & 1)) {
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'readFiles' does not exist on type '{ roo... Remove this comment to see the full error message
            if (!FS.readFiles)
                // @ts-expect-error ts-migrate(2551) FIXME: Property 'readFiles' does not exist on type '{ roo... Remove this comment to see the full error message
                FS.readFiles = {};
            // @ts-expect-error ts-migrate(2551) FIXME: Property 'readFiles' does not exist on type '{ roo... Remove this comment to see the full error message
            if (!(path in FS.readFiles)) {
                // @ts-expect-error ts-migrate(2551) FIXME: Property 'readFiles' does not exist on type '{ roo... Remove this comment to see the full error message
                FS.readFiles[path] = 1;
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                Module["printErr"]("read file: " + path);
            }
        } try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (FS.trackingDelegate["onOpenFile"]) {
                var trackingFlags = 0;
                if ((flags & 2097155) !== 1) {
                    trackingFlags |= FS.tracking.openFlags.READ;
                }
                if ((flags & 2097155) !== 0) {
                    trackingFlags |= FS.tracking.openFlags.WRITE;
                }
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                FS.trackingDelegate["onOpenFile"](path, trackingFlags);
            }
        }
        catch (e) {
            console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
        } return stream; }), close: (function (stream: any) { if (FS.isClosed(stream)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if (stream.getdents)
            stream.getdents = null; try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream);
            }
        }
        catch (e) {
            throw e;
        }
        finally {
            FS.closeStream(stream.fd);
        } stream.fd = null; }), isClosed: (function (stream: any) { return stream.fd === null; }), llseek: (function (stream: any, offset: any, whence: any) { if (FS.isClosed(stream)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if (!stream.seekable || !stream.stream_ops.llseek) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        } stream.position = stream.stream_ops.llseek(stream, offset, whence); stream.ungotten = []; return stream.position; }), read: (function (stream: any, buffer: any, offset: any, length: any, position: any) { if (length < 0 || position < 0) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } if (FS.isClosed(stream)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if ((stream.flags & 2097155) === 1) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if (FS.isDir(stream.node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        } if (!stream.stream_ops.read) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } var seeking = typeof position !== "undefined"; if (!seeking) {
            position = stream.position;
        }
        else if (!stream.seekable) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        } var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position); if (!seeking)
            stream.position += bytesRead; return bytesRead; }), write: (function (stream: any, buffer: any, offset: any, length: any, position: any, canOwn: any) { if (length < 0 || position < 0) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } if (FS.isClosed(stream)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if ((stream.flags & 2097155) === 0) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if (FS.isDir(stream.node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        } if (!stream.stream_ops.write) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } if (stream.flags & 1024) {
            FS.llseek(stream, 0, 2);
        } var seeking = typeof position !== "undefined"; if (!seeking) {
            position = stream.position;
        }
        else if (!stream.seekable) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        } var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn); if (!seeking)
            stream.position += bytesWritten; try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (stream.path && FS.trackingDelegate["onWriteToFile"])
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                FS.trackingDelegate["onWriteToFile"](stream.path);
        }
        catch (e) {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'path'.
            console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message);
        } return bytesWritten; }), allocate: (function (stream: any, offset: any, length: any) { if (FS.isClosed(stream)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if (offset < 0 || length <= 0) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        } if ((stream.flags & 2097155) === 0) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        } if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        } if (!stream.stream_ops.allocate) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        } stream.stream_ops.allocate(stream, offset, length); }), mmap: (function (stream: any, buffer: any, offset: any, length: any, position: any, prot: any, flags: any) { if ((stream.flags & 2097155) === 1) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        } if (!stream.stream_ops.mmap) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        } return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags); }), msync: (function (stream: any, buffer: any, offset: any, length: any, mmapFlags: any) { if (!stream || !stream.stream_ops.msync) {
            return 0;
        } return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags); }), munmap: (function (stream: any) { return 0; }), ioctl: (function (stream: any, cmd: any, arg: any) { if (!stream.stream_ops.ioctl) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        } return stream.stream_ops.ioctl(stream, cmd, arg); }), readFile: (function (path: any, opts: any) { opts = opts || {}; opts.flags = opts.flags || "r"; opts.encoding = opts.encoding || "binary"; if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 5 arguments, but got 2.
        } var ret; var stream = FS.open(path, opts.flags); var stat = FS.stat(path); var length = stat.size; var buf = new Uint8Array(length); FS.read(stream, buf, 0, length, 0); if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(buf, 0);
        }
        else if (opts.encoding === "binary") {
            ret = buf;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 5 arguments, but got 3.
        } FS.close(stream); return ret; }), writeFile: (function (path: any, data: any, opts: any) { opts = opts || {}; opts.flags = opts.flags || "w"; var stream = FS.open(path, opts.flags, opts.mode); if (typeof data === "string") {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        }
        else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        }
        else {
            throw new Error("Unsupported data type");
        } FS.close(stream); }), cwd: (function () { return FS.currentPath; }), chdir: (function (path: any) { var lookup = FS.lookupPath(path, { follow: true }); if (lookup.node === null) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        } if (!FS.isDir(lookup.node.mode)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        } var err = FS.nodePermissions(lookup.node, "x"); if (err) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(err);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        } FS.currentPath = lookup.path; }), createDefaultDirectories: (function () { FS.mkdir("/tmp"); FS.mkdir("/home"); FS.mkdir("/home/web_user"); }), createDefaultDevices: (function () { FS.mkdir("/dev"); FS.registerDevice(FS.makedev(1, 3), { read: (function () { return 0; }), write: (function (stream: any, buffer: any, offset: any, length: any, pos: any) { return length; }) }); FS.mkdev("/dev/null", FS.makedev(1, 3)); TTY.register(FS.makedev(5, 0), TTY.default_tty_ops); TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops); FS.mkdev("/dev/tty", FS.makedev(5, 0)); FS.mkdev("/dev/tty1", FS.makedev(6, 0)); var random_device; if (typeof crypto !== "undefined") {
            var randomBuffer = new Uint8Array(1);
            random_device = (function () { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; });
        }
        else if (ENVIRONMENT_IS_NODE) {
            random_device = (function () { return require("crypto")["randomBytes"](1)[0]; });
        }
        else {
            random_device = (function () { return Math.random() * 256 | 0; });
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        } FS.createDevice("/dev", "random", random_device); FS.createDevice("/dev", "urandom", random_device); FS.mkdir("/dev/shm"); FS.mkdir("/dev/shm/tmp"); }), createSpecialDirectories: (function () { FS.mkdir("/proc"); FS.mkdir("/proc/self"); FS.mkdir("/proc/self/fd"); FS.mount({ mount: (function () { var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73); node.node_ops = { lookup: (function (parent: any, name: any) { var fd = +name; var stream = FS.getStream(fd); if (!stream)
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EBADF); var ret = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: (function () { return (stream as any).path; }) } }; ret.parent = ret; return ret; }) }; return node; }) }, {}, "/proc/self/fd"); }), createStandardStreams: (function () { if (Module["stdin"]) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
            FS.createDevice("/dev", "stdin", Module["stdin"]);
        }
        else {
            FS.symlink("/dev/tty", "/dev/stdin");
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        } if (Module["stdout"]) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            FS.createDevice("/dev", "stdout", null, Module["stdout"]);
        }
        else {
            FS.symlink("/dev/tty", "/dev/stdout");
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        } if (Module["stderr"]) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            FS.createDevice("/dev", "stderr", null, Module["stderr"]);
        }
        else {
            FS.symlink("/dev/tty1", "/dev/stderr");
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 5 arguments, but got 2.
        } var stdin = FS.open("/dev/stdin", "r"); assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")"); var stdout = FS.open("/dev/stdout", "w"); assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")"); var stderr = FS.open("/dev/stderr", "w"); assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")"); }), ensureErrnoError: (function () { if (FS.ErrnoError)
            // @ts-expect-error ts-migrate(2322) FIXME: Type '(errno: any, node: any) => void' is not assi... Remove this comment to see the full error message
            return; FS.ErrnoError = function ErrnoError(errno: any, node: any) { (this as any).node = node; (this as any).setErrno = (function (errno: any) { (this as any).errno = errno; for (var key in ERRNO_CODES) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (ERRNO_CODES[key] === errno) {
                (this as any).code = key;
                break;
            }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        } }); (this as any).setErrno(errno); (this as any).message = ERRNO_MESSAGES[errno]; if ((this as any).stack)
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            Object.defineProperty(this, "stack", { value: (new Error).stack, writable: true }); }; FS.ErrnoError.prototype = new Error; FS.ErrnoError.prototype.constructor = FS.ErrnoError; [ERRNO_CODES.ENOENT].forEach((function (code) { FS.genericErrors[code] = new FS.ErrnoError(code); FS.genericErrors[code].stack = "<generic error, no stack>"; })); }), staticInit: (function () { FS.ensureErrnoError(); FS.nameTable = new Array(4096); FS.mount(MEMFS, {}, "/"); FS.createDefaultDirectories(); FS.createDefaultDevices(); FS.createSpecialDirectories(); FS.filesystems = { "MEMFS": MEMFS, "IDBFS": IDBFS, "NODEFS": NODEFS, "WORKERFS": WORKERFS }; }), init: (function (input: any, output: any, error: any) { assert(!(FS.init as any).initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"); (FS.init as any).initialized = true; FS.ensureErrnoError(); Module["stdin"] = input || Module["stdin"]; Module["stdout"] = output || Module["stdout"]; Module["stderr"] = error || Module["stderr"]; FS.createStandardStreams(); }), quit: (function () { (FS.init as any).initialized = false; var fflush = Module["_fflush"]; if (fflush)
            fflush(0); for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
                continue;
            }
            FS.close(stream);
        } }), getMode: (function (canRead: any, canWrite: any) { var mode = 0; if (canRead)
            mode |= 292 | 73; if (canWrite)
            mode |= 146; return mode; }), joinPath: (function (parts: any, forceRelative: any) { var path = PATH.join.apply(null, parts); if (forceRelative && path[0] == "/")
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
            path = path.substr(1); return path; }), absolutePath: (function (relative: any, base: any) { return PATH.resolve(base, relative); }), standardizePath: (function (path: any) { return PATH.normalize(path); }), findObject: (function (path: any, dontResolveLastLink: any) { var ret = FS.analyzePath(path, dontResolveLastLink); if (ret.exists) {
            return ret.object;
        }
        else {
            ___setErrNo(ret.error);
            return null;
        } }), analyzePath: (function (path: any, dontResolveLastLink: any) { try {
            var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            path = lookup.path;
        }
        catch (e) { } var ret = { isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null }; try {
            var lookup = FS.lookupPath(path, { parent: true });
            ret.parentExists = true;
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'null'.
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            ret.exists = true;
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'null'.
            ret.path = lookup.path;
            ret.object = lookup.node;
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === "/";
        }
        catch (e) {
            ret.error = e.errno;
        } return ret; }), createFolder: (function (parent: any, name: any, canRead: any, canWrite: any) { var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name); var mode = FS.getMode(canRead, canWrite); return FS.mkdir(path, mode); }), createPath: (function (parent: any, path: any, canRead: any, canWrite: any) { parent = typeof parent === "string" ? parent : FS.getPath(parent); var parts = path.split("/").reverse(); while (parts.length) {
            var part = parts.pop();
            if (!part)
                continue;
            var current = PATH.join2(parent, part);
            try {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                FS.mkdir(current);
            }
            catch (e) { }
            parent = current;
        // @ts-expect-error ts-migrate(2454) FIXME: Variable 'current' is used before being assigned.
        } return current; }), createFile: (function (parent: any, name: any, properties: any, canRead: any, canWrite: any) { var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name); var mode = FS.getMode(canRead, canWrite); return FS.create(path, mode); }), createDataFile: (function (parent: any, name: any, data: any, canRead: any, canWrite: any, canOwn: any) { var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent; var mode = FS.getMode(canRead, canWrite); var node = FS.create(path, mode); if (data) {
            if (typeof data === "string") {
                var arr = new Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i)
                    arr[i] = data.charCodeAt(i);
                data = arr;
            }
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            FS.chmod(node, mode | 146);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 5 arguments, but got 2.
            var stream = FS.open(node, "w");
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            FS.chmod(node, mode);
        } return node; }), createDevice: (function (parent: any, name: any, input: any, output: any) { var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name); var mode = FS.getMode(!!input, !!output); if (!(FS.createDevice as any).major)
            (FS.createDevice as any).major = 64; var dev = FS.makedev((FS.createDevice as any).major++, 0); FS.registerDevice(dev, { open: (function (stream: any) { stream.seekable = false; }), close: (function (stream: any) { if (output && output.buffer && output.buffer.length) {
                output(10);
            } }), read: (function (stream: any, buffer: any, offset: any, length: any, pos: any) { var bytesRead = 0; for (var i = 0; i < length; i++) {
                var result;
                try {
                    result = input();
                }
                catch (e) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
                if (result === undefined && bytesRead === 0) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                }
                if (result === null || result === undefined)
                    break;
                bytesRead++;
                buffer[offset + i] = result;
            } if (bytesRead) {
                stream.node.timestamp = Date.now();
            } return bytesRead; }), write: (function (stream: any, buffer: any, offset: any, length: any, pos: any) { for (var i = 0; i < length; i++) {
                try {
                    output(buffer[offset + i]);
                }
                catch (e) {
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EIO);
                }
            } if (length) {
                stream.node.timestamp = Date.now();
            } return i; }) }); return FS.mkdev(path, mode, dev); }), createLink: (function (parent: any, name: any, target: any, canRead: any, canWrite: any) { var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name); return FS.symlink(target, path); }), forceLoadFile: (function (obj: any) { if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
            return true; var success = true; if (typeof XMLHttpRequest !== "undefined") {
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        else if (Module["read"]) {
            try {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
                obj.contents = intArrayFromString(Module["read"](obj.url), true);
                obj.usedBytes = obj.contents.length;
            }
            catch (e) {
                success = false;
            }
        }
        else {
            throw new Error("Cannot load without read() or XMLHttpRequest.");
        } if (!success)
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            ___setErrNo(ERRNO_CODES.EIO); return success; }), createLazyFile: (function (parent: any, name: any, url: any, canRead: any, canWrite: any) { function LazyUint8Array() { this.lengthKnown = false; this.chunks = []; } LazyUint8Array.prototype.get = function LazyUint8Array_get(idx: any) { if (idx > this.length - 1 || idx < 0) {
            return undefined;
        } var chunkOffset = idx % this.chunkSize; var chunkNum = idx / this.chunkSize | 0; return this.getter(chunkNum)[chunkOffset]; }; LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter: any) { this.getter = getter; }; LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() { var xhr = new XMLHttpRequest; xhr.open("HEAD", url, false); xhr.send(null); if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status); var datalength = Number(xhr.getResponseHeader("Content-length")); var header; var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes"; var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip"; var chunkSize = 1024 * 1024; if (!hasByteServing)
            chunkSize = datalength; var doXHR = (function (from: any, to: any) { if (from > to)
            throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!"); if (to > datalength - 1)
            throw new Error("only " + datalength + " bytes available! programmer error!"); var xhr = new XMLHttpRequest; xhr.open("GET", url, false); if (datalength !== chunkSize)
            xhr.setRequestHeader("Range", "bytes=" + from + "-" + to); if (typeof Uint8Array != "undefined")
            xhr.responseType = "arraybuffer"; if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        } xhr.send(null); if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status); if (xhr.response !== undefined) {
            return new Uint8Array(xhr.response || []);
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            return intArrayFromString(xhr.responseText || "", true);
        } }); var lazyArray = this; lazyArray.setDataGetter((function (chunkNum: any) { var start = chunkNum * chunkSize; var end = (chunkNum + 1) * chunkSize - 1; end = Math.min(end, datalength - 1); if (typeof lazyArray.chunks[chunkNum] === "undefined") {
            lazyArray.chunks[chunkNum] = doXHR(start, end);
        } if (typeof lazyArray.chunks[chunkNum] === "undefined")
            throw new Error("doXHR failed!"); return lazyArray.chunks[chunkNum]; })); if (usesGzip || !datalength) {
            chunkSize = datalength = 1;
            datalength = this.getter(0).length;
            chunkSize = datalength;
            console.log("LazyFiles on gzip forces download of the whole file when length is accessed");
        } this._length = datalength; this._chunkSize = chunkSize; this.lengthKnown = true; }; if (typeof XMLHttpRequest !== "undefined") {
            if (!ENVIRONMENT_IS_WORKER)
                throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
            var lazyArray = new LazyUint8Array;
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            Object.defineProperties(lazyArray, { length: { get: (function () { if (!this.lengthKnown) {
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        this.cacheLength();
                    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                    } return this._length; }) }, chunkSize: { get: (function () { if (!this.lengthKnown) {
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        this.cacheLength();
                    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                    } return this._chunkSize; }) } });
            var properties = { isDevice: false, contents: lazyArray };
        }
        else {
            // @ts-expect-error ts-migrate(2403) FIXME: Subsequent variable declarations must have the sam... Remove this comment to see the full error message
            var properties = { isDevice: false, url: url };
        } var node = FS.createFile(parent, name, properties, canRead, canWrite); if (properties.contents) {
            node.contents = properties.contents;
        }
        else if ((properties as any).url) {
            node.contents = null;
            node.url = (properties as any).url;
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        } Object.defineProperties(node, { usedBytes: { get: (function () { return this.contents.length; }) } }); var stream_ops = {}; var keys = Object.keys(node.stream_ops); keys.forEach((function (key) { var fn = node.stream_ops[key]; stream_ops[key] = function forceLoadLazyFile() { if (!FS.forceLoadFile(node)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
        } return fn.apply(null, arguments); }; })); (stream_ops as any).read = function stream_ops_read(stream: any, buffer: any, offset: any, length: any, position: any) { if (!FS.forceLoadFile(node)) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
        } var contents = stream.node.contents; if (position >= contents.length)
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            return 0; var size = Math.min(contents.length - position, length); assert(size >= 0); if (contents.slice) {
            for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents[position + i];
            }
        }
        else {
            for (var i = 0; i < size; i++) {
                buffer[offset + i] = contents.get(position + i);
            }
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'Browser'.
        } return size; }; node.stream_ops = stream_ops; return node; }), createPreloadedFile: (function (parent: any, name: any, url: any, canRead: any, canWrite: any, onload: any, onerror: any, dontCreateFile: any, canOwn: any, preFinish: any) { Browser.init(); var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent; var dep = getUniqueRunDependency("cp " + fullname); function processData(byteArray: any) { function finish(byteArray: any) { if (preFinish)
            preFinish(); if (!dontCreateFile) {
            FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        } if (onload)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            onload(); removeRunDependency(dep); } var handled = false; Module["preloadPlugins"].forEach((function (plugin: any) { if (handled)
            return; if (plugin["canHandle"](fullname)) {
            plugin["handle"](byteArray, fullname, finish, (function () { if (onerror)
                onerror(); removeRunDependency(dep); }));
            handled = true;
        } })); if (!handled)
            finish(byteArray); } addRunDependency(dep); if (typeof url == "string") {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'Browser'.
            Browser.asyncLoad(url, (function (byteArray: any) { processData(byteArray); }), onerror);
        }
        else {
            processData(url);
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'msIndexedDB' does not exist on type 'Win... Remove this comment to see the full error message
        } }), indexedDB: (function () { return window.indexedDB || (window as any).mozIndexedDB || (window as any).webkitIndexedDB || window.msIndexedDB; }), DB_NAME: (function () { return "EM_FS_" + window.location.pathname; }), DB_VERSION: 20, DB_STORE_NAME: "FILE_DATA", saveFilesToDB: (function (paths: any, onload: any, onerror: any) { onload = onload || (function () { }); onerror = onerror || (function () { }); var indexedDB = FS.indexedDB(); try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        }
        catch (e) {
            return onerror(e);
        } openRequest.onupgradeneeded = function openRequest_onupgradeneeded() { console.log("creating db"); var db = openRequest.result; db.createObjectStore(FS.DB_STORE_NAME); }; openRequest.onsuccess = function openRequest_onsuccess() { var db = openRequest.result; var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite"); var files = transaction.objectStore(FS.DB_STORE_NAME); var ok = 0, fail = 0, total = paths.length; function finish() { if (fail == 0)
            onload();
        else
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            onerror(); } paths.forEach((function (path: any) { var putRequest = files.put(FS.analyzePath(path).object.contents, path); putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total)
            finish(); }; putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total)
            finish(); }; })); transaction.onerror = onerror; }; openRequest.onerror = onerror; }), loadFilesFromDB: (function (paths: any, onload: any, onerror: any) { onload = onload || (function () { }); onerror = onerror || (function () { }); var indexedDB = FS.indexedDB(); try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        }
        catch (e) {
            return onerror(e);
        } openRequest.onupgradeneeded = onerror; openRequest.onsuccess = function openRequest_onsuccess() { var db = openRequest.result; try {
            var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
        }
        catch (e) {
            onerror(e);
            return;
        } var files = transaction.objectStore(FS.DB_STORE_NAME); var ok = 0, fail = 0, total = paths.length; function finish() { if (fail == 0)
            onload();
        else
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            onerror(); } paths.forEach((function (path: any) { var getRequest = files.get(path); getRequest.onsuccess = function getRequest_onsuccess() { if (FS.analyzePath(path).exists) {
            FS.unlink(path);
        } FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true); ok++; if (ok + fail == total)
            finish(); }; getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total)
            finish(); }; })); transaction.onerror = onerror; }; openRequest.onerror = onerror; }) };
    var SYSCALLS = { DEFAULT_POLLMASK: 5, mappings: {}, umask: 511, calculateAt: (function (dirfd: any, path: any) { if (path[0] !== "/") {
            var dir;
            if (dirfd === -100) {
                dir = FS.cwd();
            }
            else {
                var dirstream = FS.getStream(dirfd);
                if (!dirstream)
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                dir = (dirstream as any).path;
            }
            path = PATH.join2(dir, path);
        } return path; }), doStat: (function (func: any, path: any, buf: any) { try {
            var stat = func(path);
        }
        catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                return -ERRNO_CODES.ENOTDIR;
            }
            throw e;
        } HEAP32[buf >> 2] = stat.dev; HEAP32[buf + 4 >> 2] = 0; HEAP32[buf + 8 >> 2] = stat.ino; HEAP32[buf + 12 >> 2] = stat.mode; HEAP32[buf + 16 >> 2] = stat.nlink; HEAP32[buf + 20 >> 2] = stat.uid; HEAP32[buf + 24 >> 2] = stat.gid; HEAP32[buf + 28 >> 2] = stat.rdev; HEAP32[buf + 32 >> 2] = 0; HEAP32[buf + 36 >> 2] = stat.size; HEAP32[buf + 40 >> 2] = 4096; HEAP32[buf + 44 >> 2] = stat.blocks; HEAP32[buf + 48 >> 2] = stat.atime.getTime() / 1e3 | 0; HEAP32[buf + 52 >> 2] = 0; HEAP32[buf + 56 >> 2] = stat.mtime.getTime() / 1e3 | 0; HEAP32[buf + 60 >> 2] = 0; HEAP32[buf + 64 >> 2] = stat.ctime.getTime() / 1e3 | 0; HEAP32[buf + 68 >> 2] = 0; HEAP32[buf + 72 >> 2] = stat.ino; return 0; }), doMsync: (function (addr: any, stream: any, len: any, flags: any) { var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len)); FS.msync(stream, buffer, 0, len, flags); }), doMkdir: (function (path: any, mode: any) { path = PATH.normalize(path); if (path[path.length - 1] === "/")
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
            path = path.substr(0, path.length - 1); FS.mkdir(path, mode, 0); return 0; }), doMknod: (function (path: any, mode: any, dev: any) { switch (mode & 61440) {
            case 32768:
            case 8192:
            case 24576:
            case 4096:
            case 49152: break;
            default: return -ERRNO_CODES.EINVAL;
        } FS.mknod(path, mode, dev); return 0; }), doReadlink: (function (path: any, buf: any, bufsize: any) { if (bufsize <= 0)
            return -ERRNO_CODES.EINVAL; var ret = FS.readlink(path); var len = Math.min(bufsize, lengthBytesUTF8(ret)); var endChar = HEAP8[buf + len]; stringToUTF8(ret, buf, bufsize + 1); HEAP8[buf + len] = endChar; return len; }), doAccess: (function (path: any, amode: any) { if (amode & ~7) {
            return -ERRNO_CODES.EINVAL;
        } var node; var lookup = FS.lookupPath(path, { follow: true }); node = lookup.node; var perms = ""; if (amode & 4)
            perms += "r"; if (amode & 2)
            perms += "w"; if (amode & 1)
            perms += "x"; if (perms && FS.nodePermissions(node, perms)) {
            return -ERRNO_CODES.EACCES;
        } return 0; }), doDup: (function (path: any, flags: any, suggestFD: any) { var suggest = FS.getStream(suggestFD); if (suggest)
            FS.close(suggest); return FS.open(path, flags, 0, suggestFD, suggestFD).fd; }), doReadv: (function (stream: any, iov: any, iovcnt: any, offset: any) { var ret = 0; for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.read(stream, HEAP8, ptr, len, offset);
            if (curr < 0)
                return -1;
            ret += curr;
            if (curr < len)
                break;
        } return ret; }), doWritev: (function (stream: any, iov: any, iovcnt: any, offset: any) { var ret = 0; for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 6 arguments, but got 5.
            var curr = FS.write(stream, HEAP8, ptr, len, offset);
            if (curr < 0)
                return -1;
            ret += curr;
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        } return ret; }), varargs: 0, get: (function (varargs: any) { SYSCALLS.varargs += 4; var ret = HEAP32[SYSCALLS.varargs - 4 >> 2]; return ret; }), getStr: (function () { var ret = Pointer_stringify(SYSCALLS.get()); return ret; }), getStreamFromFD: (function () { var stream = FS.getStream(SYSCALLS.get()); if (!stream)
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF); return stream; }), getSocketFromFD: (function () { var socket = SOCKFS.getSocket(SYSCALLS.get()); if (!socket)
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(ERRNO_CODES.EBADF); return socket; }), getSocketAddress: (function (allowNull: any) { var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get(); if (allowNull && addrp === 0)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__read_sockaddr'.
            return null; var info = __read_sockaddr(addrp, addrlen); if (info.errno)
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            throw new FS.ErrnoError(info.errno); info.addr = DNS.lookup_addr(info.addr) || info.addr; return info; }), get64: (function () { var low = SYSCALLS.get(), high = SYSCALLS.get(); if (low >= 0)
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            assert(high === 0);
        else
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            assert(high === -1); return low; }), getZero: (function () { assert(SYSCALLS.get() === 0); }) };
    function ___syscall140(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
        var offset = offset_low;
        FS.llseek(stream, offset, whence);
        HEAP32[result >> 2] = (stream as any).position;
        if ((stream as any).getdents && offset === 0 && whence === 0)
            (stream as any).getdents = null;
        return 0;
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___syscall145(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        return SYSCALLS.doReadv(stream, iov, iovcnt);
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___syscall146(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        return SYSCALLS.doWritev(stream, iov, iovcnt);
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___syscall183(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        var buf = SYSCALLS.get(), size = SYSCALLS.get();
        if (size === 0)
            return -ERRNO_CODES.EINVAL;
        var cwd = FS.cwd();
        var cwdLengthInBytes = lengthBytesUTF8(cwd);
        if (size < cwdLengthInBytes + 1)
            return -ERRNO_CODES.ERANGE;
        stringToUTF8(cwd, buf, size);
        return buf;
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___syscall198(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        var path = SYSCALLS.getStr(), owner = SYSCALLS.get(), group = SYSCALLS.get();
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        FS.chown(path, owner, group);
        return 0;
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    var PROCINFO = { ppid: 1, pid: 42, sid: 42, pgid: 42 };
    function ___syscall20(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        return PROCINFO.pid;
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___syscall6(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        var stream = SYSCALLS.getStreamFromFD();
        FS.close(stream);
        return 0;
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___syscall60(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        var mask = SYSCALLS.get();
        var old = SYSCALLS.umask;
        SYSCALLS.umask = mask;
        return old;
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___syscall83(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        var target = SYSCALLS.getStr(), linkpath = SYSCALLS.getStr();
        FS.symlink(target, linkpath);
        return 0;
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___syscall91(which: any, varargs: any) { SYSCALLS.varargs = varargs; try {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        var addr = SYSCALLS.get(), len = SYSCALLS.get();
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var info = SYSCALLS.mappings[addr];
        if (!info)
            return 0;
        if (len === info.len) {
            var stream = FS.getStream(info.fd);
            SYSCALLS.doMsync(addr, stream, len, info.flags);
            FS.munmap(stream);
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            SYSCALLS.mappings[addr] = null;
            if (info.allocated) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
                _free(info.malloc);
            }
        }
        return 0;
    }
    catch (e) {
        // @ts-expect-error ts-migrate(2359) FIXME: The right-hand side of an 'instanceof' expression ... Remove this comment to see the full error message
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno;
    } }
    function ___unlock() { }
    var structRegistrations = {};
    function runDestructors(destructors: any) { while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
    } }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function simpleReadValueFromPointer(pointer: any) { return this["fromWireType"](HEAPU32[pointer >> 2]); }
    var awaitingDependencies = {};
    var registeredTypes = {};
    var typeDependencies = {};
    var char_0 = 48;
    var char_9 = 57;
    function makeLegalFunctionName(name: any) { if (undefined === name) {
        return "_unknown";
    } name = name.replace(/[^a-zA-Z0-9_]/g, "$"); var f = name.charCodeAt(0); if (f >= char_0 && f <= char_9) {
        return "_" + name;
    }
    else {
        return name;
    } }
    function createNamedFunction(name: any, body: any) { name = makeLegalFunctionName(name); return (new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n"))(body); }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function extendError(baseErrorType: any, errorName: any) { var errorClass = createNamedFunction(errorName, (function (message: any) { this.name = errorName; this.message = message; var stack = (new Error(message)).stack; if (stack !== undefined) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
    } })); errorClass.prototype = Object.create(baseErrorType.prototype); errorClass.prototype.constructor = errorClass; errorClass.prototype.toString = (function () { if (this.message === undefined) {
        return this.name;
    }
    else {
        return this.name + ": " + this.message;
    } }); return errorClass; }
    var InternalError: any = undefined;
    function throwInternalError(message: any) { throw new InternalError(message); }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function whenDependentTypesAreResolved(myTypes: any, dependentTypes: any, getTypeConverters: any) { myTypes.forEach((function (type: any) { typeDependencies[type] = dependentTypes; })); function onComplete(typeConverters: any) { var myTypeConverters = getTypeConverters(typeConverters); if (myTypeConverters.length !== myTypes.length) {
        throwInternalError("Mismatched type converter count");
    } for (var i = 0; i < myTypes.length; ++i) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        registerType(myTypes[i], myTypeConverters[i]);
    } } var typeConverters = new Array(dependentTypes.length); var unregisteredTypes = []; var registered = 0; dependentTypes.forEach((function (dt: any, i: any) { if (registeredTypes.hasOwnProperty(dt)) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        typeConverters[i] = registeredTypes[dt];
    }
    else {
        unregisteredTypes.push(dt);
        if (!awaitingDependencies.hasOwnProperty(dt)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            awaitingDependencies[dt] = [];
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        awaitingDependencies[dt].push((function () { typeConverters[i] = registeredTypes[dt]; ++registered; if (registered === unregisteredTypes.length) {
            onComplete(typeConverters);
        } }));
    } })); if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
    } }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function __embind_finalize_value_object(structType: any) { var reg = structRegistrations[structType]; delete structRegistrations[structType]; var rawConstructor = reg.rawConstructor; var rawDestructor = reg.rawDestructor; var fieldRecords = reg.fields; var fieldTypes = fieldRecords.map((function (field: any) { return field.getterReturnType; })).concat(fieldRecords.map((function (field: any) { return field.setterArgumentType; }))); whenDependentTypesAreResolved([structType], fieldTypes, (function (fieldTypes: any) { var fields = {}; fieldRecords.forEach((function (field: any, i: any) { var fieldName = field.fieldName; var getterReturnType = fieldTypes[i]; var getter = field.getter; var getterContext = field.getterContext; var setterArgumentType = fieldTypes[i + fieldRecords.length]; var setter = field.setter; var setterContext = field.setterContext; fields[fieldName] = { read: (function (ptr: any) { return getterReturnType["fromWireType"](getter(getterContext, ptr)); }), write: (function (ptr: any, o: any) { var destructors: any = []; setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o)); runDestructors(destructors); }) }; })); return [{ name: reg.name, "fromWireType": (function (ptr: any) { var rv = {}; for (var i in fields) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                rv[i] = fields[i].read(ptr);
            } rawDestructor(ptr); return rv; }), "toWireType": (function (destructors: any, o: any) { for (var fieldName in fields) {
                if (!(fieldName in o)) {
                    throw new TypeError("Missing field");
                }
            } var ptr = rawConstructor(); for (fieldName in fields) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                fields[fieldName].write(ptr, o[fieldName]);
            } if (destructors !== null) {
                destructors.push(rawDestructor, ptr);
            } return ptr; }), "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: rawDestructor }]; })); }
    function getShiftFromSize(size: any) { switch (size) {
        case 1: return 0;
        case 2: return 1;
        case 4: return 2;
        case 8: return 3;
        default: throw new TypeError("Unknown type size: " + size);
    } }
    function embind_init_charCodes() { var codes = new Array(256); for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
    } embind_charCodes = codes; }
    var embind_charCodes: any = undefined;
    function readLatin1String(ptr: any) { var ret = ""; var c = ptr; while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]];
    } return ret; }
    var BindingError: any = undefined;
    function throwBindingError(message: any) { throw new BindingError(message); }
    function registerType(rawType: any, registeredInstance: any, options: any) { options = options || {}; if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance");
    } var name = registeredInstance.name; if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
    } if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
            return;
        }
        else {
            throwBindingError("Cannot register type '" + name + "' twice");
        }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } registeredTypes[rawType] = registeredInstance; delete typeDependencies[rawType]; if (awaitingDependencies.hasOwnProperty(rawType)) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var callbacks = awaitingDependencies[rawType];
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        delete awaitingDependencies[rawType];
        callbacks.forEach((function (cb: any) { cb(); }));
    } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    function __embind_register_bool(rawType: any, name: any, size: any, trueValue: any, falseValue: any) { var shift = getShiftFromSize(size); name = readLatin1String(name); registerType(rawType, { name: name, "fromWireType": (function (wt: any) { return !!wt; }), "toWireType": (function (destructors: any, o: any) { return o ? trueValue : falseValue; }), "argPackAdvance": 8, "readValueFromPointer": (function (pointer: any) { var heap; if (size === 1) {
            heap = HEAP8;
        }
        else if (size === 2) {
            heap = HEAP16;
        }
        else if (size === 4) {
            heap = HEAP32;
        }
        else {
            throw new TypeError("Unknown boolean type size: " + name);
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        } return this["fromWireType"](heap[pointer >> shift]); }), destructorFunction: null }); }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function ClassHandle_isAliasOf(other: any) { if (!(this instanceof ClassHandle)) {
        return false;
    } if (!(other instanceof ClassHandle)) {
        return false;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } var leftClass = this.$$.ptrType.registeredClass; var left = this.$$.ptr; var rightClass = (other as any).$$.ptrType.registeredClass; var right = (other as any).$$.ptr; while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
    } while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
    } return leftClass === rightClass && left === right; }
    function shallowCopyInternalPointer(o: any) { return { count: o.count, deleteScheduled: o.deleteScheduled, preservePointerOnDelete: o.preservePointerOnDelete, ptr: o.ptr, ptrType: o.ptrType, smartPtr: o.smartPtr, smartPtrType: o.smartPtrType }; }
    function throwInstanceAlreadyDeleted(obj: any) { function getInstanceTypeName(handle: any) { return handle.$$.ptrType.registeredClass.name; } throwBindingError(getInstanceTypeName(obj) + " instance already deleted"); }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function ClassHandle_clone() { if (!this.$$.ptr) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwInstanceAlreadyDeleted(this);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } if (this.$$.preservePointerOnDelete) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.$$.count.value += 1;
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        return this;
    }
    else {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        var clone = Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } });
        clone.$$.count.value += 1;
        clone.$$.deleteScheduled = false;
        return clone;
    } }
    function runDestructor(handle: any) { var $$ = handle.$$; if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
    }
    else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
    } }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function ClassHandle_delete() { if (!this.$$.ptr) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwInstanceAlreadyDeleted(this);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion");
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } this.$$.count.value -= 1; var toDelete = 0 === this.$$.count.value; if (toDelete) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        runDestructor(this);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } if (!this.$$.preservePointerOnDelete) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.$$.smartPtr = undefined;
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.$$.ptr = undefined;
    } }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function ClassHandle_isDeleted() { return !this.$$.ptr; }
    var delayFunction: any = undefined;
    var deletionQueue: any = [];
    function flushPendingDeletes() { while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj["delete"]();
    } }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function ClassHandle_deleteLater() { if (!this.$$.ptr) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwInstanceAlreadyDeleted(this);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion");
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } deletionQueue.push(this); if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } this.$$.deleteScheduled = true; return this; }
    function init_ClassHandle() { ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf; ClassHandle.prototype["clone"] = ClassHandle_clone; ClassHandle.prototype["delete"] = ClassHandle_delete; ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted; ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater; }
    function ClassHandle() { }
    var registeredPointers = {};
    function ensureOverloadTable(proto: any, methodName: any, humanName: any) { if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        proto[methodName] = (function () { if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
            throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
        } return proto[methodName].overloadTable[arguments.length].apply(this, arguments); });
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
    } }
    function exposePublicSymbol(name: any, value: any, numArguments: any) { if (Module.hasOwnProperty(name)) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
            throwBindingError("Cannot register public name '" + name + "' twice");
        }
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module[name] = value;
        if (undefined !== numArguments) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module[name].numArguments = numArguments;
        }
    } }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function RegisteredClass(name: any, constructor: any, instancePrototype: any, rawDestructor: any, baseClass: any, getActualType: any, upcast: any, downcast: any) { this.name = name; this.constructor = constructor; this.instancePrototype = instancePrototype; this.rawDestructor = rawDestructor; this.baseClass = baseClass; this.getActualType = getActualType; this.upcast = upcast; this.downcast = downcast; this.pureVirtualFunctions = []; }
    function upcastPointer(ptr: any, ptrClass: any, desiredClass: any) { while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
            throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
    } return ptr; }
    function constNoSmartPtrRawPointerToWireType(destructors: any, handle: any) { if (handle === null) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        if (this.isReference) {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            throwBindingError("null is not a valid " + this.name);
        }
        return 0;
    } if (!handle.$$) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    } if (!handle.$$.ptr) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } var handleClass = handle.$$.ptrType.registeredClass; var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass); return ptr; }
    function genericPointerToWireType(destructors: any, handle: any) { var ptr; if (handle === null) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        if (this.isReference) {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            throwBindingError("null is not a valid " + this.name);
        }
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        if (this.isSmartPointer) {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            ptr = this.rawConstructor();
            if (destructors !== null) {
                // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
        }
        else {
            return 0;
        }
    } if (!handle.$$) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    } if (!handle.$$.ptr) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } if (!this.isConst && handle.$$.ptrType.isConst) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } var handleClass = handle.$$.ptrType.registeredClass; ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass); if (this.isSmartPointer) {
        if (undefined === handle.$$.smartPtr) {
            throwBindingError("Passing raw pointer to smart pointer is illegal");
        }
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        switch (this.sharingPolicy) {
            case 0:
                // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                }
                else {
                    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                    throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
                }
                break;
            case 1:
                ptr = handle.$$.smartPtr;
                break;
            case 2:
                // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                }
                else {
                    var clonedHandle = handle["clone"]();
                    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                    ptr = this.rawShare(ptr, __emval_register((function () { clonedHandle["delete"](); })));
                    if (destructors !== null) {
                        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
                        destructors.push(this.rawDestructor, ptr);
                    }
                }
                break;
            default: throwBindingError("Unsupporting sharing policy");
        }
    } return ptr; }
    function nonConstNoSmartPtrRawPointerToWireType(destructors: any, handle: any) { if (handle === null) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        if (this.isReference) {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            throwBindingError("null is not a valid " + this.name);
        }
        return 0;
    } if (!handle.$$) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    } if (!handle.$$.ptr) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
    } if (handle.$$.ptrType.isConst) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } var handleClass = handle.$$.ptrType.registeredClass; var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass); return ptr; }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function RegisteredPointer_getPointee(ptr: any) { if (this.rawGetPointee) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        ptr = this.rawGetPointee(ptr);
    } return ptr; }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function RegisteredPointer_destructor(ptr: any) { if (this.rawDestructor) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.rawDestructor(ptr);
    } }
    function RegisteredPointer_deleteObject(handle: any) { if (handle !== null) {
        handle["delete"]();
    } }
    // @ts-expect-error ts-migrate(7023) FIXME: 'downcastPointer' implicitly has return type 'any'... Remove this comment to see the full error message
    function downcastPointer(ptr: any, ptrClass: any, desiredClass: any) { if (ptrClass === desiredClass) {
        return ptr;
    } if (undefined === desiredClass.baseClass) {
        return null;
    // @ts-expect-error ts-migrate(7022) FIXME: 'rv' implicitly has type 'any' because it does not... Remove this comment to see the full error message
    } var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass); if (rv === null) {
        return null;
    } return desiredClass.downcast(rv); }
    function getInheritedInstanceCount() { return Object.keys(registeredInstances).length; }
    function getLiveInheritedInstances() { var rv = []; for (var k in registeredInstances) {
        if (registeredInstances.hasOwnProperty(k)) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            rv.push(registeredInstances[k]);
        }
    } return rv; }
    function setDelayFunction(fn: any) { delayFunction = fn; if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
    } }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function init_embind() { Module["getInheritedInstanceCount"] = getInheritedInstanceCount; Module["getLiveInheritedInstances"] = getLiveInheritedInstances; Module["flushPendingDeletes"] = flushPendingDeletes; Module["setDelayFunction"] = setDelayFunction; }
    var registeredInstances = {};
    function getBasestPointer(class_: any, ptr: any) { if (ptr === undefined) {
        throwBindingError("ptr should not be undefined");
    } while (class_.baseClass) {
        ptr = class_.upcast(ptr);
        class_ = class_.baseClass;
    } return ptr; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function getInheritedInstance(class_: any, ptr: any) { ptr = getBasestPointer(class_, ptr); return registeredInstances[ptr]; }
    function makeClassHandle(prototype: any, record: any) { if (!record.ptrType || !record.ptr) {
        throwInternalError("makeClassHandle requires ptr and ptrType");
    } var hasSmartPtrType = !!record.smartPtrType; var hasSmartPtr = !!record.smartPtr; if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError("Both smartPtrType and smartPtr must be specified");
    } record.count = { value: 1 }; return Object.create(prototype, { $$: { value: record } }); }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function RegisteredPointer_fromWireType(ptr: any) { var rawPointer = this.getPointee(ptr); if (!rawPointer) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.destructor(ptr);
        return null;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer); if (undefined !== registeredInstance) {
        if (0 === registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr = rawPointer;
            registeredInstance.$$.smartPtr = ptr;
            return registeredInstance["clone"]();
        }
        else {
            var rv = registeredInstance["clone"]();
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.destructor(ptr);
            return rv;
        }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } function makeDefaultHandle() { if (this.isSmartPointer) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: rawPointer, smartPtrType: this, smartPtr: ptr });
    }
    else {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr: ptr });
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } } var actualType = this.registeredClass.getActualType(rawPointer); var registeredPointerRecord = registeredPointers[actualType]; if (!registeredPointerRecord) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        return makeDefaultHandle.call(this);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } var toType; if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
    }
    else {
        toType = registeredPointerRecord.pointerType;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass); if (dp === null) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        return makeDefaultHandle.call(this);
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } if (this.isSmartPointer) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
    }
    else {
        return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
    } }
    function init_RegisteredPointer() { RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee; RegisteredPointer.prototype.destructor = RegisteredPointer_destructor; RegisteredPointer.prototype["argPackAdvance"] = 8; RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer; RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject; RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType; }
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function RegisteredPointer(name: any, registeredClass: any, isReference: any, isConst: any, isSmartPointer: any, pointeeType: any, sharingPolicy: any, rawGetPointee: any, rawConstructor: any, rawShare: any, rawDestructor: any) { this.name = name; this.registeredClass = registeredClass; this.isReference = isReference; this.isConst = isConst; this.isSmartPointer = isSmartPointer; this.pointeeType = pointeeType; this.sharingPolicy = sharingPolicy; this.rawGetPointee = rawGetPointee; this.rawConstructor = rawConstructor; this.rawShare = rawShare; this.rawDestructor = rawDestructor; if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this["toWireType"] = constNoSmartPtrRawPointerToWireType;
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.destructorFunction = null;
        }
        else {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            this.destructorFunction = null;
        }
    }
    else {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this["toWireType"] = genericPointerToWireType;
    } }
    function replacePublicSymbol(name: any, value: any, numArguments: any) { if (!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol");
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module[name] = value;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module[name].argCount = numArguments;
    } }
    function embind__requireFunction(signature: any, rawFunction: any) { signature = readLatin1String(signature); function makeDynCaller(dynCall: any) { var args = []; for (var i = 1; i < signature.length; ++i) {
        args.push("a" + i);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } var name = "dynCall_" + signature + "_" + rawFunction; var body = "return function " + name + "(" + args.join(", ") + ") {\n"; body += "    return dynCall(rawFunction" + (args.length ? ", " : "") + args.join(", ") + ");\n"; body += "};\n"; return (new Function("dynCall", "rawFunction", body))(dynCall, rawFunction); } var fp; if (Module["FUNCTION_TABLE_" + signature] !== undefined) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        fp = Module["FUNCTION_TABLE_" + signature][rawFunction];
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'FUNCTION_TABLE'.
    else if (typeof FUNCTION_TABLE !== "undefined") {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'FUNCTION_TABLE'.
        fp = FUNCTION_TABLE[rawFunction];
    }
    else {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var dc = Module["asm"]["dynCall_" + signature];
        if (dc === undefined) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            dc = Module["asm"]["dynCall_" + signature.replace(/f/g, "d")];
            if (dc === undefined) {
                throwBindingError("No dynCall invoker for signature: " + signature);
            }
        }
        fp = makeDynCaller(dc);
    } if (typeof fp !== "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
    } return fp; }
    var UnboundTypeError: any = undefined;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    function getTypeName(type: any) { var ptr = ___getTypeName(type); var rv = readLatin1String(ptr); _free(ptr); return rv; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function throwUnboundTypeError(message: any, types: any) { var unboundTypes: any = []; var seen = {}; function visit(type: any) { if (seen[type]) {
        return;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } if (registeredTypes[type]) {
        return;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } if (typeDependencies[type]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        typeDependencies[type].forEach(visit);
        return;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } unboundTypes.push(type); seen[type] = true; } types.forEach(visit); throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "])); }
    function __embind_register_class(rawType: any, rawPointerType: any, rawConstPointerType: any, baseClassRawType: any, getActualTypeSignature: any, getActualType: any, upcastSignature: any, upcast: any, downcastSignature: any, downcast: any, name: any, destructorSignature: any, rawDestructor: any) { name = readLatin1String(name); getActualType = embind__requireFunction(getActualTypeSignature, getActualType); if (upcast) {
        upcast = embind__requireFunction(upcastSignature, upcast);
    } if (downcast) {
        downcast = embind__requireFunction(downcastSignature, downcast);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    } rawDestructor = embind__requireFunction(destructorSignature, rawDestructor); var legalFunctionName = makeLegalFunctionName(name); exposePublicSymbol(legalFunctionName, (function () { throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType]); })); whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], (function (base: any) { base = base[0]; var baseClass; var basePrototype; if (baseClassRawType) {
        baseClass = base.registeredClass;
        basePrototype = baseClass.instancePrototype;
    }
    else {
        basePrototype = ClassHandle.prototype;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } var constructor = createNamedFunction(legalFunctionName, (function () { if (Object.getPrototypeOf(this) !== instancePrototype) {
        throw new BindingError("Use 'new' to construct " + name);
    } if (undefined === registeredClass.constructor_body) {
        throw new BindingError(name + " has no accessible constructor");
    } var body = registeredClass.constructor_body[arguments.length]; if (undefined === body) {
        throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    } return body.apply(this, arguments); })); var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } }); constructor.prototype = instancePrototype; var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast); var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false); var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false); var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false); registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter }; replacePublicSymbol(legalFunctionName, constructor); return [referenceConverter, pointerConverter, constPointerConverter]; })); }
    function heap32VectorToArray(count: any, firstElement: any) { var array = []; for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i]);
    } return array; }
    function __embind_register_class_constructor(rawClassType: any, argCount: any, rawArgTypesAddr: any, invokerSignature: any, invoker: any, rawConstructor: any) { var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr); invoker = embind__requireFunction(invokerSignature, invoker); whenDependentTypesAreResolved([], [rawClassType], (function (classType: any) { classType = classType[0]; var humanName = "constructor " + classType.name; if (undefined === classType.registeredClass.constructor_body) {
        classType.registeredClass.constructor_body = [];
    } if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
        throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
    } classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() { throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes); }; whenDependentTypesAreResolved([], rawArgTypes, (function (argTypes: any) { classType.registeredClass.constructor_body[argCount - 1] = function constructor_body() { if (arguments.length !== argCount - 1) {
        throwBindingError(humanName + " called with " + arguments.length + " arguments, expected " + (argCount - 1));
    } var destructors: any = []; var args = new Array(argCount); args[0] = rawConstructor; for (var i = 1; i < argCount; ++i) {
        args[i] = argTypes[i]["toWireType"](destructors, arguments[i - 1]);
    } var ptr = invoker.apply(null, args); runDestructors(destructors); return argTypes[0]["fromWireType"](ptr); }; return []; })); return []; })); }
    function new_(constructor: any, argumentList: any) { if (!(constructor instanceof Function)) {
        throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function");
    } var dummy = createNamedFunction(constructor.name || "unknownFunctionName", (function () { })); dummy.prototype = constructor.prototype; var obj = new dummy; var r = constructor.apply(obj, argumentList); return r instanceof Object ? r : obj; }
    function craftInvokerFunction(humanName: any, argTypes: any, classType: any, cppInvokerFunc: any, cppTargetFunc: any) { var argCount = argTypes.length; if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
    } var isClassMethodFunc = argTypes[1] !== null && classType !== null; var needsDestructorStack = false; for (var i = 1; i < argTypes.length; ++i) {
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            needsDestructorStack = true;
            break;
        }
    } var returns = argTypes[0].name !== "void"; var argsList = ""; var argsListWired = ""; for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
    } var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n"; if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
    } var dtorStack = needsDestructorStack ? "destructors" : "null"; var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"]; var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]]; if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
    } for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
        args1.push("argType" + i);
        args2.push(argTypes[i + 2]);
    } if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
    } invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n"; if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
    }
    else {
        for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                args1.push(paramName + "_dtor");
                args2.push(argTypes[i].destructorFunction);
            }
        }
    } if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n";
    }
    else { } invokerFnBody += "}\n"; args1.push(invokerFnBody); var invokerFunction = new_(Function, args1).apply(null, args2); return invokerFunction; }
    function __embind_register_class_function(rawClassType: any, methodName: any, argCount: any, rawArgTypesAddr: any, invokerSignature: any, rawInvoker: any, context: any, isPureVirtual: any) { var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr); methodName = readLatin1String(methodName); rawInvoker = embind__requireFunction(invokerSignature, rawInvoker); whenDependentTypesAreResolved([], [rawClassType], (function (classType: any) { classType = classType[0]; var humanName = classType.name + "." + methodName; if (isPureVirtual) {
        classType.registeredClass.pureVirtualFunctions.push(methodName);
    } function unboundTypesHandler() { throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes); } var proto = classType.registeredClass.instancePrototype; var method = proto[methodName]; if (undefined === method || undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
        unboundTypesHandler.argCount = argCount - 2;
        unboundTypesHandler.className = classType.name;
        proto[methodName] = unboundTypesHandler;
    }
    else {
        ensureOverloadTable(proto, methodName, humanName);
        proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
    } whenDependentTypesAreResolved([], rawArgTypes, (function (argTypes: any) { var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context); if (undefined === proto[methodName].overloadTable) {
        memberFunction.argCount = argCount - 2;
        proto[methodName] = memberFunction;
    }
    else {
        proto[methodName].overloadTable[argCount - 2] = memberFunction;
    } return []; })); return []; })); }
    var emval_free_list: any = [];
    var emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }];
    function __emval_decref(handle: any) { if (handle > 4 && 0 === --(emval_handle_array[handle] as any).refcount) {
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'undefined' is not assignable to type '{ valu... Remove this comment to see the full error message
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle);
    } }
    function count_emval_handles() { var count = 0; for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            ++count;
        }
    } return count; }
    function get_first_emval() { for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i];
        }
    } return null; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function init_emval() { Module["count_emval_handles"] = count_emval_handles; Module["get_first_emval"] = get_first_emval; }
    function __emval_register(value: any) { switch (value) {
        case undefined:
            {
                return 1;
            }
            ;
        case null:
            {
                return 2;
            }
            ;
        case true:
            {
                return 3;
            }
            ;
        case false:
            {
                return 4;
            }
            ;
        default: {
            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ refcount: number; value: any; }' is not as... Remove this comment to see the full error message
            emval_handle_array[handle] = { refcount: 1, value: value };
            return handle;
        }
    } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    function __embind_register_emval(rawType: any, name: any) { name = readLatin1String(name); registerType(rawType, { name: name, "fromWireType": (function (handle: any) { var rv = emval_handle_array[handle].value; __emval_decref(handle); return rv; }), "toWireType": (function (destructors: any, value: any) { return __emval_register(value); }), "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null }); }
    function _embind_repr(v: any) { if (v === null) {
        return "null";
    // @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
    } var t = typeof v; if (t === "object" || t === "array" || t === "function") {
        return v.toString();
    }
    else {
        return "" + v;
    } }
    function floatReadValueFromPointer(name: any, shift: any) { switch (shift) {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        case 2: return function (pointer: any) { return this["fromWireType"](HEAPF32[pointer >> 2]); };
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        case 3: return function (pointer: any) { return this["fromWireType"](HEAPF64[pointer >> 3]); };
        default: throw new TypeError("Unknown float type: " + name);
    } }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    function __embind_register_float(rawType: any, name: any, size: any) { var shift = getShiftFromSize(size); name = readLatin1String(name); registerType(rawType, { name: name, "fromWireType": (function (value: any) { return value; }), "toWireType": (function (destructors: any, value: any) { if (typeof value !== "number" && typeof value !== "boolean") {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
        } return value; }), "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null }); }
    function integerReadValueFromPointer(name: any, shift: any, signed: any) { switch (shift) {
        case 0: return signed ? function readS8FromPointer(pointer: any) { return HEAP8[pointer]; } : function readU8FromPointer(pointer: any) { return HEAPU8[pointer]; };
        case 1: return signed ? function readS16FromPointer(pointer: any) { return HEAP16[pointer >> 1]; } : function readU16FromPointer(pointer: any) { return HEAPU16[pointer >> 1]; };
        case 2: return signed ? function readS32FromPointer(pointer: any) { return HEAP32[pointer >> 2]; } : function readU32FromPointer(pointer: any) { return HEAPU32[pointer >> 2]; };
        default: throw new TypeError("Unknown integer type: " + name);
    } }
    function __embind_register_integer(primitiveType: any, name: any, size: any, minRange: any, maxRange: any) { name = readLatin1String(name); if (maxRange === -1) {
        maxRange = 4294967295;
    } var shift = getShiftFromSize(size); var fromWireType = (function (value: any) { return value; }); if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = (function (value) { return value << bitshift >>> bitshift; });
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    } var isUnsignedType = name.indexOf("unsigned") != -1; registerType(primitiveType, { name: name, "fromWireType": fromWireType, "toWireType": (function (destructors: any, value: any) { if (typeof value !== "number" && typeof value !== "boolean") {
            // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
            throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
        } if (value < minRange || value > maxRange) {
            throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!");
        // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
        } return isUnsignedType ? value >>> 0 : value | 0; }), "argPackAdvance": 8, "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null }); }
    function __embind_register_memory_view(rawType: any, dataTypeIndex: any, name: any) { var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array]; var TA = typeMapping[dataTypeIndex]; function decodeMemoryView(handle: any) { handle = handle >> 2; var heap = HEAPU32; var size = heap[handle]; var data = heap[handle + 1]; return new TA(heap["buffer"], data, size); } name = readLatin1String(name); registerType(rawType, { name: name, "fromWireType": decodeMemoryView, "argPackAdvance": 8, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true }); }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    function __embind_register_std_string(rawType: any, name: any) { name = readLatin1String(name); registerType(rawType, { name: name, "fromWireType": (function (value: any) { var length = HEAPU32[value >> 2]; var a = new Array(length); for (var i = 0; i < length; ++i) {
            a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        } _free(value); return a.join(""); }), "toWireType": (function (destructors: any, value: any) { if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
        } function getTAElement(ta: any, index: any) { return ta[index]; } function getStringElement(string: any, index: any) { return string.charCodeAt(index); } var getElement; if (value instanceof Uint8Array) {
            getElement = getTAElement;
        }
        else if (value instanceof Uint8ClampedArray) {
            getElement = getTAElement;
        }
        else if (value instanceof Int8Array) {
            getElement = getTAElement;
        }
        else if (typeof value === "string") {
            getElement = getStringElement;
        }
        else {
            throwBindingError("Cannot pass non-string to std::string");
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        } var length = value.length; var ptr = _malloc(4 + length); HEAPU32[ptr >> 2] = length; for (var i = 0; i < length; ++i) {
            // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
            var charCode = getElement(value, i);
            if (charCode > 255) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
                _free(ptr);
                throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
            }
            HEAPU8[ptr + 4 + i] = charCode;
        } if (destructors !== null) {
            destructors.push(_free, ptr);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        } return ptr; }), "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: (function (ptr: any) { _free(ptr); }) }); }
    function __embind_register_std_wstring(rawType: any, charSize: any, name: any) { name = readLatin1String(name); var getHeap: any, shift: any; if (charSize === 2) {
        getHeap = (function () { return HEAPU16; });
        shift = 1;
    }
    else if (charSize === 4) {
        getHeap = (function () { return HEAPU32; });
        shift = 2;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    } registerType(rawType, { name: name, "fromWireType": (function (value: any) { var HEAP = getHeap(); var length = HEAPU32[value >> 2]; var a = new Array(length); var start = value + 4 >> shift; for (var i = 0; i < length; ++i) {
            a[i] = String.fromCharCode(HEAP[start + i]);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        } _free(value); return a.join(""); }), "toWireType": (function (destructors: any, value: any) { var HEAP = getHeap(); var length = value.length; var ptr = _malloc(4 + length * charSize); HEAPU32[ptr >> 2] = length; var start = ptr + 4 >> shift; for (var i = 0; i < length; ++i) {
            HEAP[start + i] = value.charCodeAt(i);
        } if (destructors !== null) {
            destructors.push(_free, ptr);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        } return ptr; }), "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: (function (ptr: any) { _free(ptr); }) }); }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function __embind_register_value_object(rawType: any, name: any, constructorSignature: any, rawConstructor: any, destructorSignature: any, rawDestructor: any) { structRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), fields: [] }; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function __embind_register_value_object_field(structType: any, fieldName: any, getterReturnType: any, getterSignature: any, getter: any, getterContext: any, setterArgumentType: any, setterSignature: any, setter: any, setterContext: any) { structRegistrations[structType].fields.push({ fieldName: readLatin1String(fieldName), getterReturnType: getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext: getterContext, setterArgumentType: setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext: setterContext }); }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    function __embind_register_void(rawType: any, name: any) { name = readLatin1String(name); registerType(rawType, { isVoid: true, name: name, "argPackAdvance": 0, "fromWireType": (function () { return undefined; }), "toWireType": (function (destructors: any, o: any) { return undefined; }) }); }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function _abort() { Module["abort"](); }
    var _environ = STATICTOP;
    STATICTOP += 16;
    function ___buildEnvironment(env: any) { var MAX_ENV_VALUES = 64; var TOTAL_ENV_SIZE = 1024; var poolPtr; var envPtr; if (!(___buildEnvironment as any).called) {
        (___buildEnvironment as any).called = true;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        ENV["USER"] = ENV["LOGNAME"] = "web_user";
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        ENV["PATH"] = "/";
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        ENV["PWD"] = "/";
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        ENV["HOME"] = "/home/web_user";
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        ENV["LANG"] = "C.UTF-8";
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        ENV["_"] = Module["thisProgram"];
        poolPtr = staticAlloc(TOTAL_ENV_SIZE);
        envPtr = staticAlloc(MAX_ENV_VALUES * 4);
        HEAP32[envPtr >> 2] = poolPtr;
        HEAP32[_environ >> 2] = envPtr;
    }
    else {
        envPtr = HEAP32[_environ >> 2];
        poolPtr = HEAP32[envPtr >> 2];
    } var strings = []; var totalSize = 0; for (var key in env) {
        if (typeof env[key] === "string") {
            var line = key + "=" + env[key];
            strings.push(line);
            totalSize += line.length;
        }
    } if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error("Environment size exceeded TOTAL_ENV_SIZE!");
    } var ptrSize = 4; for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        writeAsciiToMemory(line, poolPtr);
        HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
        poolPtr += line.length + 1;
    } HEAP32[envPtr + strings.length * ptrSize >> 2] = 0; }
    var ENV = {};
    function _getenv(name: any) { if (name === 0)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        return 0; name = Pointer_stringify(name); if (!ENV.hasOwnProperty(name))
        return 0; if ((_getenv as any).ret)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        _free((_getenv as any).ret); (_getenv as any).ret = allocateUTF8(ENV[name]); return (_getenv as any).ret; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function _getgrnam() { Module["printErr"]("missing function: getgrnam"); abort(-1); }
    function _getpwnam() { throw "getpwnam: TODO"; }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
    function _jsClose() { return jsAPI.close.apply(null, arguments); }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
    function _jsCreate(filename: any) { return jsAPI.create.call(null, UTF32ToString(filename)); }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
    function _jsOpen(filename: any) { return jsAPI.open.call(null, UTF32ToString(filename)); }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
    function _jsRead() { return jsAPI.read.apply(null, arguments); }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 4.
    function _jsSeek(fd: any, offset: any, method: any) { return jsAPI.seek.call(null, fd, offset, UTF8ToString(method)); }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
    function _jsTell() { return jsAPI.tell.apply(null, arguments); }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
    function _jsWrite() { return jsAPI.write.apply(null, arguments); }
    function _llvm_eh_typeid_for(type: any) { return type; }
    var ___tm_current = STATICTOP;
    STATICTOP += 48;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
    var ___tm_timezone = allocate(intArrayFromString("GMT"), "i8", ALLOC_STATIC);
    var _tzname = STATICTOP;
    STATICTOP += 16;
    var _daylight = STATICTOP;
    STATICTOP += 16;
    var _timezone = STATICTOP;
    STATICTOP += 16;
    function _tzset() { if ((_tzset as any).called)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
        return; (_tzset as any).called = true; HEAP32[_timezone >> 2] = (new Date).getTimezoneOffset() * 60; var winter = new Date(2e3, 0, 1); var summer = new Date(2e3, 6, 1); HEAP32[_daylight >> 2] = Number(winter.getTimezoneOffset() != summer.getTimezoneOffset()); function extractZone(date: any) { var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/); return match ? match[1] : "GMT"; } var winterName = extractZone(winter); var summerName = extractZone(summer); var winterNamePtr = allocate(intArrayFromString(winterName), "i8", ALLOC_NORMAL); var summerNamePtr = allocate(intArrayFromString(summerName), "i8", ALLOC_NORMAL); if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
        HEAP32[_tzname >> 2] = winterNamePtr;
        HEAP32[_tzname + 4 >> 2] = summerNamePtr;
    }
    else {
        HEAP32[_tzname >> 2] = summerNamePtr;
        HEAP32[_tzname + 4 >> 2] = winterNamePtr;
    } }
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    function _localtime_r(time: any, tmPtr: any) { _tzset(); var date = new Date(HEAP32[time >> 2] * 1e3); HEAP32[tmPtr >> 2] = date.getSeconds(); HEAP32[tmPtr + 4 >> 2] = date.getMinutes(); HEAP32[tmPtr + 8 >> 2] = date.getHours(); HEAP32[tmPtr + 12 >> 2] = date.getDate(); HEAP32[tmPtr + 16 >> 2] = date.getMonth(); HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900; HEAP32[tmPtr + 24 >> 2] = date.getDay(); var start = new Date(date.getFullYear(), 0, 1); var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0; HEAP32[tmPtr + 28 >> 2] = yday; HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60); var summerOffset = (new Date(2e3, 6, 1)).getTimezoneOffset(); var winterOffset = start.getTimezoneOffset(); var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0; HEAP32[tmPtr + 32 >> 2] = dst; var zonePtr = HEAP32[_tzname + (dst ? 4 : 0) >> 2]; HEAP32[tmPtr + 40 >> 2] = zonePtr; return tmPtr; }
    function _localtime(time: any) { return _localtime_r(time, ___tm_current); }
    function _emscripten_memcpy_big(dest: any, src: any, num: any) { HEAPU8.set(HEAPU8.subarray(src, src + num), dest); return dest; }
    function _mktime(tmPtr: any) { _tzset(); var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0); var dst = HEAP32[tmPtr + 32 >> 2]; var guessedOffset = date.getTimezoneOffset(); var start = new Date(date.getFullYear(), 0, 1); var summerOffset = (new Date(2e3, 6, 1)).getTimezoneOffset(); var winterOffset = start.getTimezoneOffset(); var dstOffset = Math.min(winterOffset, summerOffset); if (dst < 0) {
        HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
    }
    else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
    } HEAP32[tmPtr + 24 >> 2] = date.getDay(); var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0; HEAP32[tmPtr + 28 >> 2] = yday; return date.getTime() / 1e3 | 0; }
    var PTHREAD_SPECIFIC = {};
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function _pthread_getspecific(key: any) { return PTHREAD_SPECIFIC[key] || 0; }
    var PTHREAD_SPECIFIC_NEXT_KEY = 1;
    function _pthread_key_create(key: any, destructor: any) { if (key == 0) {
        return ERRNO_CODES.EINVAL;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } HEAP32[key >> 2] = PTHREAD_SPECIFIC_NEXT_KEY; PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0; PTHREAD_SPECIFIC_NEXT_KEY++; return 0; }
    function _pthread_once(ptr: any, func: any) { if (!(_pthread_once as any).seen)
        (_pthread_once as any).seen = {}; if (ptr in (_pthread_once as any).seen)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return; Module["dynCall_v"](func); (_pthread_once as any).seen[ptr] = 1; }
    function _pthread_setspecific(key: any, value: any) { if (!(key in PTHREAD_SPECIFIC)) {
        return ERRNO_CODES.EINVAL;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } PTHREAD_SPECIFIC[key] = value; return 0; }
    function _time(ptr: any) { var ret = Date.now() / 1e3 | 0; if (ptr) {
        HEAP32[ptr >> 2] = ret;
    } return ret; }
    FS.staticInit();
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    __ATINIT__.unshift((function () { if (!Module["noFSInit"] && !(FS.init as any).initialized)
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 0.
        FS.init(); }));
    __ATMAIN__.push((function () { FS.ignorePermissions = false; }));
    __ATEXIT__.push((function () { FS.quit(); }));
    __ATINIT__.unshift((function () { TTY.init(); }));
    __ATEXIT__.push((function () { TTY.shutdown(); }));
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    InternalError = Module["InternalError"] = extendError(Error, "InternalError");
    embind_init_charCodes();
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    BindingError = Module["BindingError"] = extendError(Error, "BindingError");
    init_ClassHandle();
    init_RegisteredPointer();
    init_embind();
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
    init_emval();
    ___buildEnvironment(ENV);
    DYNAMICTOP_PTR = staticAlloc(4);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    STACK_BASE = STACKTOP = alignMemory(STATICTOP);
    STACK_MAX = STACK_BASE + TOTAL_STACK;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    DYNAMIC_BASE = alignMemory(STACK_MAX);
    HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
    staticSealed = true;
    function intArrayFromString(stringy: any, dontAddNull: any, length: any) { var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1; var u8array = new Array(len); var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length); if (dontAddNull)
        u8array.length = numBytesWritten; return u8array; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["wasmTableSize"] = 316;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["wasmMaxTableSize"] = 316;
    function invoke_i(index: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_i"](index);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_ii(index: any, a1: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_ii"](index, a1);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_iii(index: any, a1: any, a2: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_iii"](index, a1, a2);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_iiii(index: any, a1: any, a2: any, a3: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_iiii"](index, a1, a2, a3);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_iiiii(index: any, a1: any, a2: any, a3: any, a4: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_iiiii"](index, a1, a2, a3, a4);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_iiiiiii(index: any, a1: any, a2: any, a3: any, a4: any, a5: any, a6: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_iiiiiii"](index, a1, a2, a3, a4, a5, a6);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_iiiiiiiiii(index: any, a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_iiiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_iiiiiijii(index: any, a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_iiiiiijii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_ijj(index: any, a1: any, a2: any, a3: any, a4: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_ijj"](index, a1, a2, a3, a4);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_ji(index: any, a1: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Module["dynCall_ji"](index, a1);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_v(index: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_v"](index);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_vi(index: any, a1: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_vi"](index, a1);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_vii(index: any, a1: any, a2: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_vii"](index, a1, a2);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_viii(index: any, a1: any, a2: any, a3: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_viii"](index, a1, a2, a3);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_viiii(index: any, a1: any, a2: any, a3: any, a4: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_viiii"](index, a1, a2, a3, a4);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_viiiii(index: any, a1: any, a2: any, a3: any, a4: any, a5: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_viiiii"](index, a1, a2, a3, a4, a5);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_viiiiii(index: any, a1: any, a2: any, a3: any, a4: any, a5: any, a6: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_viiiiii"](index, a1, a2, a3, a4, a5, a6);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_viiiiiiiii(index: any, a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_viiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_viiiiiiiiii(index: any, a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any, a10: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_viiiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_vij(index: any, a1: any, a2: any, a3: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_vij"](index, a1, a2, a3);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    function invoke_viji(index: any, a1: any, a2: any, a3: any, a4: any) { try {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["dynCall_viji"](index, a1, a2, a3, a4);
    }
    catch (e) {
        if (typeof e !== "number" && e !== "longjmp")
            throw e;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setThrew"](1, 0);
    } }
    (Module as any).asmGlobalArg = {};
    (Module as any).asmLibraryArg = { "abort": abort, "enlargeMemory": enlargeMemory, "getTotalMemory": getTotalMemory, "abortOnCannotGrowMemory": abortOnCannotGrowMemory, "invoke_i": invoke_i, "invoke_ii": invoke_ii, "invoke_iii": invoke_iii, "invoke_iiii": invoke_iiii, "invoke_iiiii": invoke_iiiii, "invoke_iiiiiii": invoke_iiiiiii, "invoke_iiiiiiiiii": invoke_iiiiiiiiii, "invoke_iiiiiijii": invoke_iiiiiijii, "invoke_ijj": invoke_ijj, "invoke_ji": invoke_ji, "invoke_v": invoke_v, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_viii": invoke_viii, "invoke_viiii": invoke_viiii, "invoke_viiiii": invoke_viiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiiiiii": invoke_viiiiiiiiii, "invoke_vij": invoke_vij, "invoke_viji": invoke_viji, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_begin_catch": ___cxa_begin_catch, "___cxa_end_catch": ___cxa_end_catch, "___cxa_find_matching_catch_2": ___cxa_find_matching_catch_2, "___cxa_find_matching_catch_3": ___cxa_find_matching_catch_3, "___cxa_find_matching_catch_4": ___cxa_find_matching_catch_4, "___cxa_free_exception": ___cxa_free_exception, "___cxa_throw": ___cxa_throw, "___lock": ___lock, "___map_file": ___map_file, "___resumeException": ___resumeException, "___setErrNo": ___setErrNo, "___syscall140": ___syscall140, "___syscall145": ___syscall145, "___syscall146": ___syscall146, "___syscall183": ___syscall183, "___syscall198": ___syscall198, "___syscall20": ___syscall20, "___syscall6": ___syscall6, "___syscall60": ___syscall60, "___syscall83": ___syscall83, "___syscall91": ___syscall91, "___unlock": ___unlock, "__embind_finalize_value_object": __embind_finalize_value_object, "__embind_register_bool": __embind_register_bool, "__embind_register_class": __embind_register_class, "__embind_register_class_constructor": __embind_register_class_constructor, "__embind_register_class_function": __embind_register_class_function, "__embind_register_emval": __embind_register_emval, "__embind_register_float": __embind_register_float, "__embind_register_integer": __embind_register_integer, "__embind_register_memory_view": __embind_register_memory_view, "__embind_register_std_string": __embind_register_std_string, "__embind_register_std_wstring": __embind_register_std_wstring, "__embind_register_value_object": __embind_register_value_object, "__embind_register_value_object_field": __embind_register_value_object_field, "__embind_register_void": __embind_register_void, "_abort": _abort, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_getenv": _getenv, "_getgrnam": _getgrnam, "_getpwnam": _getpwnam, "_jsClose": _jsClose, "_jsCreate": _jsCreate, "_jsOpen": _jsOpen, "_jsRead": _jsRead, "_jsSeek": _jsSeek, "_jsTell": _jsTell, "_jsWrite": _jsWrite, "_llvm_eh_typeid_for": _llvm_eh_typeid_for, "_localtime": _localtime, "_mktime": _mktime, "_pthread_getspecific": _pthread_getspecific, "_pthread_key_create": _pthread_key_create, "_pthread_once": _pthread_once, "_pthread_setspecific": _pthread_setspecific, "_time": _time, "DYNAMICTOP_PTR": DYNAMICTOP_PTR, "STACKTOP": STACKTOP };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var asm = Module["asm"]((Module as any).asmGlobalArg, (Module as any).asmLibraryArg, buffer);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["asm"] = asm;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var __GLOBAL__sub_I_bind_cpp = Module["__GLOBAL__sub_I_bind_cpp"] = (function () { return Module["asm"]["__GLOBAL__sub_I_bind_cpp"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var __GLOBAL__sub_I_bridge_cpp = Module["__GLOBAL__sub_I_bridge_cpp"] = (function () { return Module["asm"]["__GLOBAL__sub_I_bridge_cpp"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var __GLOBAL__sub_I_crc_cpp = Module["__GLOBAL__sub_I_crc_cpp"] = (function () { return Module["asm"]["__GLOBAL__sub_I_crc_cpp"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var __GLOBAL__sub_I_global_cpp = Module["__GLOBAL__sub_I_global_cpp"] = (function () { return Module["asm"]["__GLOBAL__sub_I_global_cpp"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var ___cxa_can_catch = Module["___cxa_can_catch"] = (function () { return Module["asm"]["___cxa_can_catch"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = (function () { return Module["asm"]["___cxa_is_pointer_type"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var ___errno_location = Module["___errno_location"] = (function () { return Module["asm"]["___errno_location"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var ___getTypeName = Module["___getTypeName"] = (function () { return Module["asm"]["___getTypeName"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var _emscripten_replace_memory = Module["_emscripten_replace_memory"] = (function () { return Module["asm"]["_emscripten_replace_memory"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var _free = Module["_free"] = (function () { return Module["asm"]["_free"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var _malloc = Module["_malloc"] = (function () { return Module["asm"]["_malloc"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var setTempRet0 = Module["setTempRet0"] = (function () { return Module["asm"]["setTempRet0"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var setThrew = Module["setThrew"] = (function () { return Module["asm"]["setThrew"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var stackAlloc = Module["stackAlloc"] = (function () { return Module["asm"]["stackAlloc"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_dii = Module["dynCall_dii"] = (function () { return Module["asm"]["dynCall_dii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_i = Module["dynCall_i"] = (function () { return Module["asm"]["dynCall_i"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_ii = Module["dynCall_ii"] = (function () { return Module["asm"]["dynCall_ii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_iii = Module["dynCall_iii"] = (function () { return Module["asm"]["dynCall_iii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_iiii = Module["dynCall_iiii"] = (function () { return Module["asm"]["dynCall_iiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_iiiii = Module["dynCall_iiiii"] = (function () { return Module["asm"]["dynCall_iiiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_iiiiii = Module["dynCall_iiiiii"] = (function () { return Module["asm"]["dynCall_iiiiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = (function () { return Module["asm"]["dynCall_iiiiiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = (function () { return Module["asm"]["dynCall_iiiiiiiiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_iiiiiijii = Module["dynCall_iiiiiijii"] = (function () { return Module["asm"]["dynCall_iiiiiijii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_ijj = Module["dynCall_ijj"] = (function () { return Module["asm"]["dynCall_ijj"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_ji = Module["dynCall_ji"] = (function () { return Module["asm"]["dynCall_ji"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_v = Module["dynCall_v"] = (function () { return Module["asm"]["dynCall_v"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_vi = Module["dynCall_vi"] = (function () { return Module["asm"]["dynCall_vi"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_vii = Module["dynCall_vii"] = (function () { return Module["asm"]["dynCall_vii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_viid = Module["dynCall_viid"] = (function () { return Module["asm"]["dynCall_viid"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_viii = Module["dynCall_viii"] = (function () { return Module["asm"]["dynCall_viii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_viiii = Module["dynCall_viiii"] = (function () { return Module["asm"]["dynCall_viiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_viiiii = Module["dynCall_viiiii"] = (function () { return Module["asm"]["dynCall_viiiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_viiiiii = Module["dynCall_viiiiii"] = (function () { return Module["asm"]["dynCall_viiiiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = (function () { return Module["asm"]["dynCall_viiiiiiiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = (function () { return Module["asm"]["dynCall_viiiiiiiiii"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_vij = Module["dynCall_vij"] = (function () { return Module["asm"]["dynCall_vij"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dynCall_viji = Module["dynCall_viji"] = (function () { return Module["asm"]["dynCall_viji"].apply(null, arguments); });
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["asm"] = asm;
    // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    function ExitStatus(status: any) { this.name = "ExitStatus"; this.message = "Program terminated with exit(" + status + ")"; this.status = status; }
    ExitStatus.prototype = new Error;
    ExitStatus.prototype.constructor = ExitStatus;
    var initialStackTop: any;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    dependenciesFulfilled = function runCaller() { if (!Module["calledRun"])
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        run(); if (!Module["calledRun"])
        dependenciesFulfilled = runCaller; };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function run(args: any) { args = args || Module["arguments"]; if (runDependencies > 0) {
        return;
    } preRun(); if (runDependencies > 0)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return; if (Module["calledRun"])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return; function doRun() { if (Module["calledRun"])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return; Module["calledRun"] = true; if (ABORT)
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return; ensureInitRuntime(); preMain(); if (Module["onRuntimeInitialized"])
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["onRuntimeInitialized"](); postRun(); } if (Module["setStatus"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["setStatus"]("Running...");
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        setTimeout((function () { setTimeout((function () { Module["setStatus"](""); }), 1); doRun(); }), 1);
    }
    else {
        doRun();
    } }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["run"] = run;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function exit(status: any, implicit: any) { if (implicit && Module["noExitRuntime"] && status === 0) {
        return;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } if (Module["noExitRuntime"]) { }
    else {
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'boolean' is not assignable to type 'number'.
        ABORT = true;
        EXITSTATUS = status;
        STACKTOP = initialStackTop;
        exitRuntime();
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (Module["onExit"])
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module["onExit"](status);
    } if (ENVIRONMENT_IS_NODE) {
        process["exit"](status);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    } Module["quit"](status, new ExitStatus(status)); }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["exit"] = exit;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    function abort(what: any) { if (Module["onAbort"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Module["onAbort"](what);
    } if (what !== undefined) {
        (Module as any).print(what);
        (Module as any).printErr(what);
        what = JSON.stringify(what);
    }
    else {
        what = "";
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'boolean' is not assignable to type 'number'.
    } ABORT = true; EXITSTATUS = 1; throw "abort(" + what + "). Build with -s ASSERTIONS=1 for more info."; }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["abort"] = abort;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (Module["preInit"]) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (typeof Module["preInit"] == "function")
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module["preInit"] = [Module["preInit"]];
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        while (Module["preInit"].length > 0) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            Module["preInit"].pop()();
        }
    }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    Module["noExitRuntime"] = true;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    run();
    return unpack;
};
//-------------------------------------------------------------
/**
 * Returns a Promise containing the rar extractor for the given filename.
 * @private
 */
function getExtractor(url: any) {
    return fetch(new Request(url))
        .then(response => {
        if (response.ok)
            return response.arrayBuffer();
        else {
            throw new Error('404 Error: File not found.');
        }
    })
        .then(buffer => unpackBridge.createExtractorFromData(buffer));
}
/**
 *  Returns a string representing the formatted contents of the given file.
 * @private
 */
function extract({ resourceId, url }: any) {
    return new Promise(function (resolve, reject) {
        if (!unpackBridge) {
            throw new Error('unpackBridge not detected');
        }
        if (!unpack) {
            throw new Error('unpack not detected');
        }
        getExtractor(url).then(extractor => {
            // return extractor.extractAll();
            resolve(extractor.extractAll());
        }, err => {
            reject(err);
        });
    });
}
function returnData(event: any, data: any) {
    const [state, list] = data;
    if (state.state == 'FAIL') {
        const result = {
            type: 'ERROR',
            reason: state.reason,
            msg: state.msg,
            resourceId: event.data.resourceId,
            url: event.data.url
        };
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 1.
        self.postMessage(result);
        return;
    }
    const result = {
        type: 'FINISHED',
        resourceId: event.data.resourceId,
        entries: {}
    };
    const transferables = [];
    if (list && list.files) {
        for (const file of list.files) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            result.entries[file.fileHeader.name] = file.extract[1];
            transferables.push(file.extract[1].buffer);
        }
    }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any[]' is not assignable to para... Remove this comment to see the full error message
    self.postMessage(result, transferables);
}
/**
 * Listen for messages sent to the worker.
 * @private
 */
onmessage = function (event) {
    if (event.data.type == 'init') {
        unpack = initunpack(event.data.wasmUrl);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 1.
        unpack.onRuntimeInitialized = () => postMessage({ type: 'WASM_LOADED' });
    }
    else if (event.data.type == 'fetch') {
        extract(event.data).then(unpacked => {
            returnData(event, unpacked);
        }, err => {
            const result = {
                type: 'ERROR',
                resourceId: event.data.resourceId,
                url: event.data.url
            };
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2-3 arguments, but got 1.
            self.postMessage(result);
        });
    }
    else if (event.data.type == 'unpack') {
        const { buffer } = event.data;
        if (!unpackBridge) {
            throw new Error('unpackBridge not detected');
        }
        if (!unpack) {
            throw new Error('unpack not detected');
        }
        const extractor = unpackBridge.createExtractorFromData(buffer);
        const unpacked = extractor.extractAll();
        returnData(event, unpacked);
    }
};
/**
 * When the WASM runtime has been initialized on the unpack.js module, send a message indicating
 * that the library is ready.
 */
