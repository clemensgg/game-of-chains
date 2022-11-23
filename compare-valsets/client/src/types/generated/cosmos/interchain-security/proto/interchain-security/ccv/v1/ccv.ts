/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { ValidatorUpdate } from "../../../../../../tendermint/abci/types";

export const protobufPackage = "interchain_security.ccv.v1";

/**
 * This packet is sent from provider chain to consumer chain if the validator
 * set for consumer chain changes (due to new bonding/unbonding messages or
 * slashing events) A VSCMatured packet from consumer chain will be sent
 * asynchronously once unbonding period is over, and this will function as
 * `UnbondingOver` message for this packet.
 */
export interface ValidatorSetChangePacketData {
  validatorUpdates: ValidatorUpdate[];
  valsetUpdateId: Long;
  /**
   * consensus address of consumer chain validators
   * successfully slashed on the provider chain
   */
  slashAcks: string[];
}

export interface UnbondingOp {
  id: Long;
  /** consumer chains that are still unbonding */
  unbondingConsumerChains: string[];
}

/**
 * This packet is sent from the consumer chain to the provider chain
 * to notify that a VSC packet reached maturity on the consumer chain.
 */
export interface VSCMaturedPacketData {
  /** the id of the VSC packet that reached maturity */
  valsetUpdateId: Long;
}

/** UnbondingOpsIndex defines a list of unbonding operation ids. */
export interface UnbondingOpsIndex {
  ids: Long[];
}

/** MaturedUnbondingOps defines a list of ids corresponding to ids of matured unbonding operations. */
export interface MaturedUnbondingOps {
  ids: Long[];
}

function createBaseValidatorSetChangePacketData(): ValidatorSetChangePacketData {
  return { validatorUpdates: [], valsetUpdateId: Long.UZERO, slashAcks: [] };
}

export const ValidatorSetChangePacketData = {
  encode(message: ValidatorSetChangePacketData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.validatorUpdates) {
      ValidatorUpdate.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.valsetUpdateId.isZero()) {
      writer.uint32(16).uint64(message.valsetUpdateId);
    }
    for (const v of message.slashAcks) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ValidatorSetChangePacketData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorSetChangePacketData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorUpdates.push(ValidatorUpdate.decode(reader, reader.uint32()));
          break;
        case 2:
          message.valsetUpdateId = reader.uint64() as Long;
          break;
        case 3:
          message.slashAcks.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ValidatorSetChangePacketData {
    return {
      validatorUpdates: Array.isArray(object?.validatorUpdates)
        ? object.validatorUpdates.map((e: any) => ValidatorUpdate.fromJSON(e))
        : [],
      valsetUpdateId: isSet(object.valsetUpdateId) ? Long.fromValue(object.valsetUpdateId) : Long.UZERO,
      slashAcks: Array.isArray(object?.slashAcks) ? object.slashAcks.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: ValidatorSetChangePacketData): unknown {
    const obj: any = {};
    if (message.validatorUpdates) {
      obj.validatorUpdates = message.validatorUpdates.map((e) => e ? ValidatorUpdate.toJSON(e) : undefined);
    } else {
      obj.validatorUpdates = [];
    }
    message.valsetUpdateId !== undefined && (obj.valsetUpdateId = (message.valsetUpdateId || Long.UZERO).toString());
    if (message.slashAcks) {
      obj.slashAcks = message.slashAcks.map((e) => e);
    } else {
      obj.slashAcks = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ValidatorSetChangePacketData>, I>>(object: I): ValidatorSetChangePacketData {
    const message = createBaseValidatorSetChangePacketData();
    message.validatorUpdates = object.validatorUpdates?.map((e) => ValidatorUpdate.fromPartial(e)) || [];
    message.valsetUpdateId = (object.valsetUpdateId !== undefined && object.valsetUpdateId !== null)
      ? Long.fromValue(object.valsetUpdateId)
      : Long.UZERO;
    message.slashAcks = object.slashAcks?.map((e) => e) || [];
    return message;
  },
};

function createBaseUnbondingOp(): UnbondingOp {
  return { id: Long.UZERO, unbondingConsumerChains: [] };
}

export const UnbondingOp = {
  encode(message: UnbondingOp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.id.isZero()) {
      writer.uint32(8).uint64(message.id);
    }
    for (const v of message.unbondingConsumerChains) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UnbondingOp {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnbondingOp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint64() as Long;
          break;
        case 2:
          message.unbondingConsumerChains.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UnbondingOp {
    return {
      id: isSet(object.id) ? Long.fromValue(object.id) : Long.UZERO,
      unbondingConsumerChains: Array.isArray(object?.unbondingConsumerChains)
        ? object.unbondingConsumerChains.map((e: any) => String(e))
        : [],
    };
  },

  toJSON(message: UnbondingOp): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || Long.UZERO).toString());
    if (message.unbondingConsumerChains) {
      obj.unbondingConsumerChains = message.unbondingConsumerChains.map((e) => e);
    } else {
      obj.unbondingConsumerChains = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UnbondingOp>, I>>(object: I): UnbondingOp {
    const message = createBaseUnbondingOp();
    message.id = (object.id !== undefined && object.id !== null) ? Long.fromValue(object.id) : Long.UZERO;
    message.unbondingConsumerChains = object.unbondingConsumerChains?.map((e) => e) || [];
    return message;
  },
};

function createBaseVSCMaturedPacketData(): VSCMaturedPacketData {
  return { valsetUpdateId: Long.UZERO };
}

export const VSCMaturedPacketData = {
  encode(message: VSCMaturedPacketData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.valsetUpdateId.isZero()) {
      writer.uint32(8).uint64(message.valsetUpdateId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VSCMaturedPacketData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVSCMaturedPacketData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.valsetUpdateId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): VSCMaturedPacketData {
    return { valsetUpdateId: isSet(object.valsetUpdateId) ? Long.fromValue(object.valsetUpdateId) : Long.UZERO };
  },

  toJSON(message: VSCMaturedPacketData): unknown {
    const obj: any = {};
    message.valsetUpdateId !== undefined && (obj.valsetUpdateId = (message.valsetUpdateId || Long.UZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<VSCMaturedPacketData>, I>>(object: I): VSCMaturedPacketData {
    const message = createBaseVSCMaturedPacketData();
    message.valsetUpdateId = (object.valsetUpdateId !== undefined && object.valsetUpdateId !== null)
      ? Long.fromValue(object.valsetUpdateId)
      : Long.UZERO;
    return message;
  },
};

function createBaseUnbondingOpsIndex(): UnbondingOpsIndex {
  return { ids: [] };
}

export const UnbondingOpsIndex = {
  encode(message: UnbondingOpsIndex, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UnbondingOpsIndex {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnbondingOpsIndex();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint64() as Long);
            }
          } else {
            message.ids.push(reader.uint64() as Long);
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UnbondingOpsIndex {
    return { ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => Long.fromValue(e)) : [] };
  },

  toJSON(message: UnbondingOpsIndex): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => (e || Long.UZERO).toString());
    } else {
      obj.ids = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UnbondingOpsIndex>, I>>(object: I): UnbondingOpsIndex {
    const message = createBaseUnbondingOpsIndex();
    message.ids = object.ids?.map((e) => Long.fromValue(e)) || [];
    return message;
  },
};

function createBaseMaturedUnbondingOps(): MaturedUnbondingOps {
  return { ids: [] };
}

export const MaturedUnbondingOps = {
  encode(message: MaturedUnbondingOps, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MaturedUnbondingOps {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMaturedUnbondingOps();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint64() as Long);
            }
          } else {
            message.ids.push(reader.uint64() as Long);
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MaturedUnbondingOps {
    return { ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => Long.fromValue(e)) : [] };
  },

  toJSON(message: MaturedUnbondingOps): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => (e || Long.UZERO).toString());
    } else {
      obj.ids = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MaturedUnbondingOps>, I>>(object: I): MaturedUnbondingOps {
    const message = createBaseMaturedUnbondingOps();
    message.ids = object.ids?.map((e) => Long.fromValue(e)) || [];
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Long ? string | number | Long : T extends Array<infer U> ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
