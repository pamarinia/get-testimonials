/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { toast } from "sonner";
import { processAudioAction } from "./reviews.action";
import { useLocalStorage } from "react-use";

export type ReviewTextSelectorProps = {
  productId: string;
};

export const ReviewTextSelector = (props: ReviewTextSelectorProps) => {
  return (
    <div className="w-full max-w-lg">
      <Tabs defaultValue="audio">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio">Audio Note</TabsTrigger>
          <TabsTrigger value="text">Text Note</TabsTrigger>
        </TabsList>
        <TabsContent value="audio" className="flex flex-col gap-2">
          <AudioRecorderControl
            productId={props.productId}
            onAudioFinish={(blob) => console.log(blob)}
          />
          <p className="max-w-sm text-center text-sm font-light text-muted-foreground">
            Just record your thoughts and we will convert it to text for you.
          </p>
        </TabsContent>
        <TabsContent value="text">
          <InputControl />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const InputControl = ({}) => {
  const [input, setInput] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="Write your review here..."
        className="w-full bg-accent/50"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button variant="default" size="sm">
        Submit
      </Button>
    </div>
  );
};

const AudioRecorderControl = ({
  onAudioFinish,
  productId,
}: {
  onAudioFinish: (blob: Blob) => void;
  productId: string;
}) => {
  const [blob, setBlob] = useState<Blob | null>(null);

  const recorderControls = useAudioRecorder();
  const queryClient = useQueryClient();
  const [reviewId] = useLocalStorage<null | string>(
    `review-id-${productId}`,
    null
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!blob) {
        toast.error("No audio to save");
        return;
      }

      if (!reviewId) {
        toast.error("No review id found");
        return;
      }

      const formData = new FormData();
      const file = new File([blob], "audio.webm", { type: "audio/webm" });
      formData.append("audio", file);

      const result = await processAudioAction({
        formData,
        productId: productId,
        reviewId: reviewId,
      });

      if (result?.serverError || !result?.data) {
        toast.error(result?.serverError || "Failed to save audio");
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["review", result.data.id, "product", productId],
      });
    },
  });

  return (
    <div className="flex flex-col items-center gap-2">
      {blob && <audio controls src={URL.createObjectURL(blob)}></audio>}
      <AudioRecorder
        onRecordingComplete={(blob) => {
          onAudioFinish(blob);
          setBlob(blob);
        }}
        recorderControls={recorderControls}
      />
      {recorderControls.isRecording && (
        <Button
          variant="default"
          size="sm"
          onClick={recorderControls.stopRecording}
        >
          Stop recording
        </Button>
      )}
      {blob ? (
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            mutation.mutate();
          }}
        >
          Submit
        </Button>
      ) : null}
    </div>
  );
};
