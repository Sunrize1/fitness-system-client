import React, { useState, useRef, useEffect } from "react";
import type { PostDto } from "../types";
import { Card, Group, Image, Text, Button, useMantineTheme, Stack, Badge, ActionIcon, Box } from "@mantine/core";
import { IconEdit, IconTrash, IconCalendar, IconEye } from "@tabler/icons-react";
import { usePosts } from "../contexts/PostsContext.tsx";
import { useMantineColorScheme } from "@mantine/core";
import { createImageDataUrl, createFallbackImage } from "../utils/imageUtils";
import { parseBackendDate } from "../utils/dateUtils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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
            <Card.Section>
                {imageBase64 ? (
                    <Image 
                        src={createImageDataUrl(imageBase64)} 
                        alt={title}
                        height={250}
                        fit="cover"
                        fallbackSrc={createFallbackImage(400, 250)}
                    />
                ) : (
                    <Box
                        h={200}
                        style={{
                            background: 'linear-gradient(135deg, var(--mantine-color-blue-1), var(--mantine-color-blue-0))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <IconCalendar size={48} style={{ color: 'var(--mantine-color-blue-5)', opacity: 0.5 }} />
                    </Box>
                )}
            </Card.Section>

            <Stack gap="md" mt="md">
                <Group justify="space-between" align="flex-start">
                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Text fw={500} size="lg" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                            {title}
                        </Text>
                        <Badge variant="light" color="blue" size="sm">
                            {format(parseBackendDate(createdAt), 'd MMMM yyyy', { locale: ru })}
                            {updatedAt && " (изменено)"}
                        </Badge>
                    </Stack>
                    {isAdmin && (
                        <Group gap="xs">
                            <ActionIcon variant="light" onClick={handleEdit}>
                                <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="red" onClick={() => deletePost(id)}>
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>
                    )}
                </Group>

                <div style={{ position: "relative" }}>
                    <Text
                        size="sm"
                        c="dimmed"
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
                        >
                            Показать ещё
                        </Button>
                    )}
                </div>
            </Stack>
        </Card>
    );
};