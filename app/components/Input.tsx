import { Ionicons } from "@expo/vector-icons";
import { TextInput, TextInputProps, View } from "react-native";

export type IconNameType = keyof typeof Ionicons.glyphMap
interface AdditionalProps {
    class?: string;
    icon?: IconNameType
}

type InputProps = TextInputProps & AdditionalProps;

export default function Input(props: InputProps) {
    return (
        <View className={`flex-row items-center justify-between bg-slate-200 border-[1px] rounded-xl border-slate-300 w-full px-5 py-3 ${props.class}`}>
            <TextInput
                {...props}
                className={`text-lg flex-1 align-top`}
                autoCapitalize="none"
                placeholderTextColor={"#aaa"}
            />
            <Ionicons name={props.icon} size={22} color="#aaa" />
        </View>
    );
}