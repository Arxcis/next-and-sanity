import { DashboardWidget, DashboardWidgetContainer, LayoutConfig } from "@sanity/dashboard";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useEffect, useMemo, useState } from "react";
import { useClient, useDataset, useSchema, useUserListWithPermissions, UserListWithPermissionsHookValue, SanityClient } from "sanity";
import { RouterContextValue, useRouter } from "sanity/router";

export function tasksWidget(config?: LayoutConfig & WidgetProps): DashboardWidget {
    return {
        name: "task-widget",
        component: () => TasksWidget(config ?? defaultWidgetProps),
        layout: { 
            width: config?.width,
            height: config?.height
        },
    }
}

type WidgetProps = {
    title: string;
    limit: number;
    sort: "_createdAt" | "_updatedAt";
    filter: { 
        status: ("open"|"closed")[]
    };
}
const defaultWidgetProps: WidgetProps = {
    title: "Tasks",
    limit: 50,
    sort: "_createdAt",
    filter: {
        status: ["open", "closed"]
    },
}
function TasksWidget(config: WidgetProps) {
    const dataset = useDataset()
    const client = useClient({apiVersion: "v2022-03-07"})
    const schema = useSchema()
    const router = useRouter()
    const path = useMemo(() => router.resolvePathFromState(router.state).split("?")[0], [])
    const users = useUserListWithPermissions({documentValue: null, permission: "read"})

    // 1. Get the names of all available datasets
    const [datasets, setDatasets] = useState<string[]>([])
    useEffect(() => {(async () => {
        const names = (await client.datasets.list()).map((res) => res.name)
        setDatasets(names)
    })()}, [])

    // 2. Reconfigure client to point to the "<dataset>-comments"-dataset if it exists
    const tasksClient = useMemo(() => {
        const datasetExists = datasets.includes(`${dataset}-comments`)
        if (!datasetExists) {
            return null
        }
        return client.withConfig({dataset: `${dataset}-comments`})
    }, [datasets, dataset])

    // 3. Fetch tasks
    const [tasks, setTasks] = useState<SanityTask[]>([])
    useEffect(() => {(async () => {
        if (!tasksClient) {
            return;
        }
        const tasks = await fetchTasks(tasksClient, config)
        setTasks(tasks)
    })()}, [tasksClient])

    // 4. Subscribe to task updates
    useEffect(() => {
        if (!tasksClient) {
            return;
        }
        
        console.log("[TasksWidget.tsx] Subscribing...")
        const subscription = tasksClient.listen<SanityTask>(`*[_type == "tasks.task"]`).subscribe(async update => {
            if (!update.result) { 
                return; // ...because an event without a result, is an event we are not interested in.
            }
            const createdByUser = update.result.createdByUser;
            if (!createdByUser) {
                return; // ...because user is still just editing the draft. Task not created yet.
            }
            setTimeout(async () => {
                const tasks = await fetchTasks(tasksClient, config)
                setTasks(tasks)
            }, 1000) // Wait 1 second, to make sure tasks have been updated, before fetching...
        })

        return () => subscription.unsubscribe()
    }, [tasksClient])

    return <DashboardWidgetContainer
        header={config.title}
    >
        <Card>
            <Stack space={2}>
                {tasks.map(task => Task({task, path, router, users, config}))}
            </Stack>
        </Card>
    </DashboardWidgetContainer>
}

type TaskProps = {
    path: string, 
    task: SanityTask, 
    router: RouterContextValue, 
    users: UserListWithPermissionsHookValue,
    config: WidgetProps
}
function Task({path,router,task,users,config}: TaskProps) {
    const date = new Date(task[config.sort])
    const year = date.getFullYear()
    const month = date.getMonth().toString().padStart(2,"0")
    const day = date.getDay().toString().padStart(2,"0")

    return <Card 
        key={task._id}
        flex={1}
    >
        <Button
            mode="bleed"
            style={{width: "100%"}}
            onClick={() => {
                const _path = `${path}?sidebar=tasks&viewMode=edit&selectedTask=${task._id}`
                console.info(`[TasksWidget.tsx] Navigating to: ${_path}`)
                router.navigateUrl({path: _path})
            }}
        >
            <Flex>
                <Text style={{flex: "flex-begin", marginRight: 10}}>{task.title}</Text>
                <Text style={{flex: "flex-end", marginLeft: "auto", paddingRight: 10}}>
                    {users.data?.find(user => user.id == task.assignedTo)?.displayName ?? "<not assigned>"}
                </Text>
                <Text style={{flex: "flex-end"}}>{`${year}-${month}-${day}`}</Text>
            </Flex>
        </Button>
    </Card>
}


type SanityTask = {
    _id: string;
    _updatedAt: string;
    _createdAt: string;
    title: string;
    status: "closed"|"open"
    authorId: string,
    assignedTo: string,
    createdByUser: string,
}
async function fetchTasks(client: SanityClient, config: WidgetProps) : Promise<SanityTask[]> {
    console.info(`[TasksWidget.tsx] Fetching...`)

    const tasks = await client.fetch(`
        *[_type == "tasks.task" && status in $status] | order(${config.sort} desc) [0...$limit] {
            _id,
            _updatedAt,
            _createdAt,
            title,
            status,
            authorId,
            assignedTo,
            createdByUser,
        }`, 
        { ...config, ...config.filter}
    )

    console.info(`[TasksWidget.tsx] Got ${tasks.length} tasks`)
    return tasks
}    