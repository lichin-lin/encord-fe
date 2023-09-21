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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { useState } from "react";

interface imageProps {
  fileName: string;
  size: number;
  timestamp: string;
  // future todo: add preview thumbnail
}

export default function Home() {
  const [imageList, setImageList] = useState<imageProps[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Images
  const inputFile = React.useRef(null);
  const onButtonClick = () => {
    if (inputFile?.current) {
      inputFile?.current?.click();
    }
  };
  const onAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      const len = e.target.files.length;
      const list = [];
      for (let i = 0; i < len; i++) {
        const file = e.target.files[i];
        const newData: imageProps = {
          timestamp: `${file?.lastModified}`,
          fileName: file.name,
          size: file.size,
        };
        list.push(newData);
        // const reader = new FileReader();
        // reader.addEventListener("load", () => {
        //   console.log(reader.result);
        // });
        // reader.readAsDataURL(selectedFiles[0]);
      }
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
          <div className="">
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
                  {imageList.map((image) => (
                    <TableRow>
                      <TableCell className="font-medium">
                        {image.fileName}
                      </TableCell>
                      <TableCell>{image.timestamp}</TableCell>
                      <TableCell>{image.size}</TableCell>
                      <TableCell className="text-right">
                        {/* Dialog */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>Predict</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Start a New Prediction</DialogTitle>
                              <DialogDescription>
                                Enter the information, and start your new task.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                  Title
                                </Label>
                                <Input
                                  id="title"
                                  defaultValue="new prediction"
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="description"
                                  className="text-right"
                                >
                                  Description
                                </Label>
                                <Input
                                  id="description"
                                  defaultValue="description"
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => setDialogOpen(false)}
                                variant={"outline"}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Submit</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        <TabsContent value="predictions">for predictions</TabsContent>
      </Tabs>
    </main>
  );
}
