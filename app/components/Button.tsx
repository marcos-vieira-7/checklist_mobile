import { Pressable, TextInputProps  } from "react-native";
interface AdditionalProps {
    class?: string,
    disabled?: false | true
}

type ButtonProps = TextInputProps & AdditionalProps

export default function Button(props: ButtonProps) {
    const opacity = props.disabled ? "opacity-50" : "opacity-100";
    return (
        <Pressable
            onPress={props.disabled ? null : props.onPress}
            className={`bg-blue-600 px-6 py-3 items-center rounded-lg ${props.class} ${opacity}`}
        >
            {props.children}
        </Pressable>
    );
}