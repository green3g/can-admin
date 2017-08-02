import dev from 'can-util/js/dev/dev';
export default function jsonDeserialize (note, Type) {
    if (!note) {
        if (Type) {
            return new Type();
        }
        return note;
    }
    if (typeof note === 'string' && note.indexOf('{') > -1) {
        try {
            note = JSON.parse(note);
            if (Type) {
                note = new Type(note);
            }
        } catch (e) {
            dev.warn(e);
        }
    }
    return note;
}
