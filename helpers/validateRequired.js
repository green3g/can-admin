
export default function validateRequired (props) {
    return !props.value ? 'This field needs to be set' : undefined;
}
