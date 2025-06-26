import React, { useState, useRef, useEffect } from "react";
import type { PostDto } from "../types";
import { Card, Group, Image, Text, Button, useMantineTheme } from "@mantine/core";
import { usePosts } from "../contexts/PostsContext.tsx";
import { useMantineColorScheme } from "@mantine/core";

const getContrastColor = (bgColor: string) => {
    const color = bgColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
};

export const PostEntity = ({
                               id,
                               title,
                               description,
                               imageBase64,
                               createdAt,
                               updatedAt,
                           }: PostDto) => {
    const { isAdmin, deletePost, setPostEdit, toggleFormOpenness, formatDate } = usePosts();
    const [isDescriptionExpanded, setDescriptionExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();

    const cardBgColor = colorScheme === 'dark' ? theme.colors.dark[6] : theme.white;

    useEffect(() => {
        if (descriptionRef.current) {
            const element = descriptionRef.current;
            setHasOverflow(element.scrollHeight > element.clientHeight);
        }
    }, [description]);

    const handleEdit = () => {
        setPostEdit({ id, title, description, updatedAt, createdAt, imageBase64 });
        toggleFormOpenness();
    };

    return (
        <Card key={id} shadow="sm" padding="lg" radius="md" withBorder mb="md">
            <Card.Section>{imageBase64 && <Image src={imageBase64} alt={title} />}</Card.Section>

            <Group position="apart" mt={imageBase64 ? "xs" : "md"} mb="xs">
                <Text weight={500} style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {title}
                </Text>
            </Group>

            <div style={{ position: "relative" }}>
                <Text
                    size="sm"
                    color="dimmed"
                    mb="xs"
                    ref={descriptionRef}
                    style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: isDescriptionExpanded ? undefined : 5,
                        overflow: "hidden",
                        cursor: "default",
                    }}
                >
                    {description}
                </Text>

                {hasOverflow && !isDescriptionExpanded && (
                    <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => setDescriptionExpanded(true)}
                        style={{
                            position: "absolute",
                            right: -10,
                            bottom: 0,
                            color: getContrastColor(cardBgColor),
                            background: `linear-gradient(90deg, transparent, ${cardBgColor} 25%)`,
                            border: "none",
                        }}
                        sx={{
                            "&:hover": {
                                border: "none",
                                backgroundColor: "transparent",
                                boxShadow: "none",
                            },
                            "&:active": {
                                border: "none",
                                backgroundColor: "transparent",
                                boxShadow: "none",
                            },
                            "&:focus": {
                                border: "none",
                                boxShadow: "none",
                            }
                        }}
                    >
                        Показать ещё
                    </Button>
                )}
            </div>

            <Group spacing="xs" justify="space-between" align="end">
                {isAdmin ? (
                    <Group spacing="xs">
                        <Button size="xs" variant="outline" onClick={handleEdit}>
                            Редактировать
                        </Button>
                        <Button size="xs" color="red" variant="outline" onClick={() => deletePost(id)}>
                            Удалить
                        </Button>
                    </Group>
                ) : (
                    <div />
                )}
                <Text size="xs" color="dimmed">
                    {formatDate(updatedAt || createdAt)}
                    {updatedAt && <span style={{ marginLeft: 4 }}>(изменено)</span>}
                </Text>
            </Group>
        </Card>
    );
};