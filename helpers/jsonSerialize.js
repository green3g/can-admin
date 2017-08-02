export default function jsonSerialize (val) {
    if (!val) {
        return val;
    }
    if (typeof val === 'object') {
        if (val.serialize) {
            val = val.serialize();
        }
        val = JSON.stringify(val);
    }
    return val;
}
