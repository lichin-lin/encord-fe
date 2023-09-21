"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface imageProps {
  fileName: string;
  size: number;
  timestamp: string;
  data: string | ArrayBuffer | null;
  width: number;
  height: number;
}

interface predictionProps {
  title: string;
  description: string;
  timestamp: string;
  imageData: {
    width: number;
    height: number;
    data: string | ArrayBuffer | null;
  };
  annotationData: predictionBoxProps[];
}

interface predictionBoxProps {
  bbox: bboxProps;
  label: string;
  score: string;
}

interface bboxProps {
  x1: string;
  x2: string;
  y1: string;
  y2: string;
}
interface formProps {
  title: string;
  description: string;
}

const wait = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));
const JSONSERVER_ENDPOINT = "http://localhost:3001";

export default function Home() {
  const [formInputs, setFormInputs] = useState<formProps>();
  const [imageList, setImageList] = useState<imageProps[]>([]);
  const [predictionList, setPredictionList] = useState<predictionProps[]>([]);

  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [predictionDialogOpen, setPredictionDialogOpen] = React.useState(false);

  const [currentImageId, setCurrentImageId] = useState(-1);
  const [currentPrediction, setCurrentPrediction] =
    React.useState<predictionProps>();

  const { toast } = useToast();

  // Images
  const inputFile = React.useRef<HTMLInputElement>(null);
  const onButtonClick = () => {
    if (inputFile?.current) {
      inputFile?.current?.click();
    }
  };
  const onAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      const len = e.target.files.length;
      const list: imageProps[] = [];
      for (let i = 0; i < len; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
          let image = new Image();
          image.src = reader.result as string;

          image.onload = function () {
            const newData: imageProps = {
              timestamp: `${file?.lastModified}`,
              fileName: file.name,
              size: file.size,
              data: reader.result,
              width: image.width,
              height: image.height,
            };
            list.push(newData);
          };
        });
        reader.readAsDataURL(file);
      }
      await wait(1000);
      setImageList([...imageList, ...list]);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>
        <TabsContent className="p-2" value="images">
          {/* Action: upload button */}
          <div className="w-full flex space-between">
            <input
              multiple
              id="profilePic"
              type="file"
              accept="image/*"
              ref={inputFile}
              onChange={onAddImages}
              style={{ display: "none" }}
            />
            <Button onClick={onButtonClick} className="mb-2">
              Upload new image
            </Button>
          </div>

          {/* Content: list of card */}
          <div className="content">
            {imageList.length === 0 ? (
              <div>Start from upload your first image. 🖼️</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">File Name</TableHead>
                    <TableHead className="w-[200px]">
                      Upload Timestamp
                    </TableHead>
                    <TableHead className="w-[100px]">Size</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imageList.map((image, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {image.fileName}
                      </TableCell>
                      <TableCell>{image.timestamp}</TableCell>
                      <TableCell>{image.size}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => {
                            setCurrentImageId(index);
                            setImageDialogOpen(true);
                          }}
                        >
                          Predict
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Start a New Prediction</DialogTitle>
                  <DialogDescription>
                    Enter the information, and start your new task.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={async (event) => {
                    // instead of using JSON-SERVER, let's use
                    // Next.js server API for the mock data
                    fetch(`/api/predict`)
                    // fetch(`${JSONSERVER_ENDPOINT}/predict`)
                      .then((res) => res.json())
                      .then((data) => {
                        const date = new Date().getTime();
                        setPredictionList([
                          ...predictionList,
                          {
                            title: formInputs?.title || "",
                            description: formInputs?.description || "",
                            imageData: {
                              width: imageList[currentImageId].width,
                              height: imageList[currentImageId].height,
                              data: imageList[currentImageId].data,
                            },
                            annotationData: data.predictions,
                            timestamp: `${date}`,
                          },
                        ]);
                        toast({
                          title: "Prediction done!",
                          description:
                            "Go to prediction page and check the result 🎉",
                        });
                      })
                      .catch((err) => {
                        // Todo: show error toast
                        toast({
                          title: "Ooops! something went wrong.",
                          description: "Please try again or contact our team",
                        });
                      })
                      .finally(() => {
                        setImageDialogOpen(false);
                      });
                    event.preventDefault();
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        defaultValue=""
                        className="col-span-3"
                        onChange={(e) => {
                          setFormInputs({
                            title: e.target.value,
                            description: formInputs?.description || "",
                          });
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        defaultValue=""
                        className="col-span-3"
                        onChange={(e) => {
                          setFormInputs({
                            description: e.target.value,
                            title: formInputs?.title || "",
                          });
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => setImageDialogOpen(false)}
                      variant={"outline"}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Submit</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
        <TabsContent className="p-2" value="predictions">
          {" "}
          <div className="content">
            {predictionList.length === 0 ? (
              <div>Start from making your first prediction task. 🏗️</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Title</TableHead>
                    <TableHead className="w-[200px]">
                      Upload Timestamp
                    </TableHead>
                    <TableHead className="w-[100px]">Description</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictionList.map((prediction, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {prediction.title}
                      </TableCell>
                      <TableCell>{prediction.timestamp}</TableCell>
                      <TableCell>{prediction.description}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => {
                            setPredictionDialogOpen(true);
                            setCurrentPrediction(prediction);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <PredictionDialog
            predictionDialogOpen={predictionDialogOpen}
            setPredictionDialogOpen={setPredictionDialogOpen}
            currentPrediction={currentPrediction}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

// Prediction Dialog
interface renderBboxProps {
  w: number;
  h: number;
  t: number;
  l: number;
  label: string;
}
const PredictionDialog = ({
  predictionDialogOpen,
  setPredictionDialogOpen,
  currentPrediction,
}: {
  predictionDialogOpen: boolean;
  setPredictionDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentPrediction: predictionProps | undefined;
}) => {
  const [bbox, setBbox] = useState<renderBboxProps[]>([]);

  const onImgLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentPrediction) {
      const img = event.target as HTMLImageElement;
      let ratio = img.offsetWidth / currentPrediction.imageData.width;
      const _bbox: renderBboxProps[] = currentPrediction?.annotationData.map(
        (annotation) => {
          return {
            w:
              (parseFloat(annotation.bbox.x2) -
                parseFloat(annotation.bbox.x1)) *
              ratio,
            h:
              (parseFloat(annotation.bbox.y2) -
                parseFloat(annotation.bbox.y1)) *
              ratio,
            t: parseFloat(annotation.bbox.y1) * ratio,
            l: parseFloat(annotation.bbox.x1) * ratio,
            label: `${annotation.label} (${Math.round(
              parseFloat(annotation.score) * 100
            )}%)`,
          };
        }
      );
      setBbox(_bbox);
    }
  };

  return (
    <Dialog open={predictionDialogOpen} onOpenChange={setPredictionDialogOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Prediction Result</DialogTitle>
        </DialogHeader>
        <div className="mt-2 relative">
          <div className="absolute w-full h-full top-0 left-0">
            {bbox.map((box, index) => (
              <div
                key={index}
                className="absolute border-purple-600 border flex p-0.5 items-end justify-end bg-purple-600/10 text-purple-100 text-xs"
                style={{
                  width: box.w,
                  height: box.h,
                  top: box.t,
                  left: box.l,
                }}
              >
                {box.label}
              </div>
            ))}
          </div>
          <img
            onLoad={onImgLoad}
            alt="preview-thumbnail"
            src={`${currentPrediction?.imageData.data}`}
          ></img>
        </div>
      </DialogContent>
    </Dialog>
  );
};
