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

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface imageProps {
  fileName: string;
  size: number;
  timestamp: string;
  data: string | ArrayBuffer | null;
}

interface predictionProps {
  title: string;
  description: string;
  timestamp: string;
  ImageData: string | ArrayBuffer | null;
  annotationData: object;
}

interface formProps {
  title: string;
  description: string;
}

const wait = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));
const SERVER_ENDPOINT = "http://localhost:3001";

export default function Home() {
  const [imageList, setImageList] = useState<imageProps[]>([]);
  const [formInputs, setFormInputs] = useState<formProps>();
  const [predictionList, setPredictionList] = useState<predictionProps[]>([]);

  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [predictionDialogOpen, setPredictionDialogOpen] = React.useState(false);

  const [currentImageId, setCurrentImageId] = useState(-1);
  const [currentPrediction, setCurrentPrediction] =
    React.useState<predictionProps>();
  // Images
  const inputFile = React.useRef(null);
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
        reader.addEventListener("load", () => {
          console.log("load!");
          const newData: imageProps = {
            timestamp: `${file?.lastModified}`,
            fileName: file.name,
            size: file.size,
            data: reader.result,
          };
          list.push(newData);
        });
        reader.readAsDataURL(file);
      }
      await wait(1000);
      setImageList([...imageList, ...list]);
    }
  };
  const { toast } = useToast();

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
                    <TableRow>
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
                    // future todo: make this a POST, and send the image data to server to process!
                    fetch(`${SERVER_ENDPOINT}/predict`)
                      .then((res) => res.json())
                      .then((data) => {
                        const date = new Date().getTime();
                        setPredictionList([
                          ...predictionList,
                          {
                            title: formInputs?.title,
                            description: formInputs?.description,
                            ImageData: imageList[currentImageId].data,
                            annotationData: data,
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
                            ...formInputs,
                            title: e.target.value,
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
                            ...formInputs,
                            description: e.target.value,
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
                  {predictionList.map((prediction) => (
                    <TableRow>
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
            <Dialog
              open={predictionDialogOpen}
              onOpenChange={setPredictionDialogOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Prediction Result</DialogTitle>
                </DialogHeader>
                <div className="p-2">
                  <img src={`${currentPrediction?.ImageData}`}></img>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
