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
        <View className={`flex-row items-center justify-between bg-white border-[1px] rounded-xl border-slate-300/80 w-full px-4 py-2 focus:border focus:border-blue-400 ${props.class}`}>
            <TextInput
                {...props}
                className={`text-lg flex-1 align-top text-slate-900`}
                autoCapitalize="none"
                placeholderTextColor={"#aaa"}
            />
            <Ionicons name={props.icon} size={22} color="#aaa" />
        </View>
    );
}