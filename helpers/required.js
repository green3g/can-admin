export default function required (props) {
    return !props.value ? 'This value is requried' : undefined;
}
