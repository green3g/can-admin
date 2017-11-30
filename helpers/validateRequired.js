
export default function validateRequired (props) {
    if (props.value === 0 || props.value === false) {
        return null;
    }
    return !props.value ? 'This field needs to be set' : undefined;
}
